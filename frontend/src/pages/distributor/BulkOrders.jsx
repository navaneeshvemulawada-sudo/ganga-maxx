import React, { useState, useEffect } from 'react';
import { ShoppingCart, Percent, Save, RotateCcw, Package, Truck, CheckCircle2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import api from '../../services/api';

export default function DistributorBulkOrders() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderQtys, setOrderQtys] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchOrders();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.apiCall('/api/inventory');
      setProducts(data);
      // Initialize order quantities
      const qtys = {};
      data.forEach(p => {
        qtys[p.id] = 0;
      });
      setOrderQtys(qtys);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await api.apiCall('/api/orders');
      // Sort orders descending by ID (most recent first)
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleQtyChange = (id, val) => {
    const qty = parseInt(val) || 0;
    setOrderQtys(prev => ({
      ...prev,
      [id]: qty >= 0 ? qty : 0
    }));
  };

  const getWholesaleDiscount = (totalQty) => {
    if (totalQty > 500) return 0.20; // 20%
    if (totalQty > 200) return 0.15; // 15%
    if (totalQty > 50) return 0.10;  // 10%
    return 0.0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculations
  const totalItemsOrdered = Object.values(orderQtys).reduce((sum, qty) => sum + qty, 0);
  const discountRate = getWholesaleDiscount(totalItemsOrdered);
  
  const subtotal = products.reduce((sum, p) => {
    const qty = orderQtys[p.id] || 0;
    return sum + (qty * p.unit_price);
  }, 0);
  
  const discountAmount = subtotal * discountRate;
  const netTotal = subtotal - discountAmount;

  const handleCheckout = async () => {
    if (totalItemsOrdered === 0) {
      alert('Please select at least one item to order.');
      return;
    }
    
    try {
      setSubmitting(true);
      const orderItems = products
        .filter(p => orderQtys[p.id] > 0)
        .map(p => ({
          product_name: p.name,
          quantity: orderQtys[p.id],
          unit_price: p.unit_price,
          total_price: orderQtys[p.id] * p.unit_price
        }));

      const payload = {
        items: orderItems,
        subtotal: subtotal,
        discount_rate: discountRate,
        discount_amount: discountAmount,
        total_amount: netTotal
      };

      const newOrder = await api.apiCall('/api/orders', {
        method: 'POST',
        body: payload
      });

      alert(`Bulk order ${newOrder.order_number} of ${totalItemsOrdered} item(s) placed successfully! Total Amount: ${formatCurrency(netTotal)}.`);
      
      // Reset order
      const reset = {};
      products.forEach(p => {
        reset[p.id] = 0;
      });
      setOrderQtys(reset);
      
      // Reload orders and inventory stock
      fetchOrders();
      fetchInventory();
    } catch (err) {
      alert('Failed to place bulk order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadgeStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { backgroundColor: '#e6fbf4', color: '#10b981' };
      case 'in transit':
        return { backgroundColor: '#e0f2fe', color: '#0284c7' };
      case 'processing':
      default:
        return { backgroundColor: '#fff7ed', color: '#f97316' };
    }
  };

  const getTimelineMilestones = (order) => {
    const status = order.status.toLowerCase();
    const isProcessing = status === 'processing';
    const isInTransit = status === 'in transit';
    const isDelivered = status === 'delivered';

    return [
      { title: 'Ordered', desc: 'Bulk order successfully placed & invoice generated.', active: true },
      { title: 'Processed & Packed', desc: 'Items checked, packed & tagged at Bengaluru Warehouse Hub.', active: !isProcessing },
      { title: 'Out for Delivery / Transit', desc: 'Logistics cargo truck in transit via national highway route.', active: isDelivered || isInTransit },
      { title: 'Delivered', desc: 'Freight cargo received & signature verified at distributor center.', active: isDelivered }
    ];
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            WHOLESALE PURCHASING
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
            Bulk Dealer Ordering
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Order wholesale quantities directly and automatically receive volume tier discounts.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '3rem' }}>
        {/* Left: Product List Table */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <span>Loading product list...</span>
          </div>
        ) : (
          <div className="card-glass" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Description</th>
                    <th>Available Stock</th>
                    <th>Wholesale Price</th>
                    <th style={{ width: '120px' }}>Order Qty</th>
                    <th style={{ textAlign: 'right' }}>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{p.sku}</td>
                      <td style={{ fontWeight: '600' }}>{p.name}</td>
                      <td>{p.stock} {p.unit}</td>
                      <td>{formatCurrency(p.unit_price)}</td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ height: '32px', padding: '2px 8px', fontSize: '0.8125rem', textAlign: 'center' }}
                          value={orderQtys[p.id] || 0}
                          onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: '700', textAlign: 'right', color: 'var(--text-primary)' }}>
                        {formatCurrency((orderQtys[p.id] || 0) * p.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right: Checkout details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glass" style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Wholesale Cart Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Items Selected:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{totalItemsOrdered} units</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Cart Subtotal:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Wholesale Tier Discount:</span>
                <strong style={{ float: 'right', color: 'var(--success)' }}>
                  {discountRate > 0 ? `${discountRate * 100}%` : '0%'}
                </strong>
              </div>
              {discountAmount > 0 && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Discount Saved:</span>
                  <strong style={{ float: 'right', color: 'var(--success)' }}>-{formatCurrency(discountAmount)}</strong>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem' }}>Net Amount:</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {formatCurrency(netTotal)}
              </strong>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', height: '42px' }} disabled={submitting}>
              <ShoppingCart size={16} />
              <span>{submitting ? 'Placing Order...' : 'Checkout Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History & Shipment Tracking Section */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Order History & Delivery Tracking
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track the real-time shipping logs and logistics status of your bulk orders.
          </p>
        </div>

        {ordersLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <span>Loading orders history...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
            <p>No bulk orders found. Place your first bulk order above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const milestones = getTimelineMilestones(order);
              return (
                <div key={order.id} className="card-glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#fff' }}>
                  {/* Collapsible Header */}
                  <div
                    onClick={() => toggleOrderExpand(order.id)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: isExpanded ? 'var(--bg-primary)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>ORDER NUMBER</span>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{order.order_number}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>DATE PLACED</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(order.created_at)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>TOTAL AMOUNT</span>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{formatCurrency(order.total_amount)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>SHIPMENT STATUS</span>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            ...getStatusBadgeStyles(order.status)
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {isExpanded ? 'Hide Details' : 'Track Order'}
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Collapsible Details Drawer */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
                        {/* Order Items List */}
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Items Ordered ({order.items.length})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                <div>
                                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{item.product_name}</strong>
                                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} units</span>
                                </div>
                                <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{formatCurrency(item.total_price)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tracking Logistics and Timeline */}
                        <div>
                          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              Delivery Tracking
                            </h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <div>Carrier: <strong>{order.carrier}</strong></div>
                              <div>Estimated Arrival: <strong style={{ color: 'var(--info)' }}>{order.est_arrival || 'N/A'}</strong></div>
                            </div>
                          </div>

                          {/* Timeline display */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {milestones.map((milestone, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{
                                    backgroundColor: milestone.active ? 'var(--info)' : 'var(--border-color)',
                                    color: milestone.active ? '#fff' : 'var(--text-muted)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #fff',
                                    zIndex: 2,
                                    boxShadow: milestone.active ? '0 0 8px rgba(14, 165, 233, 0.4)' : 'none'
                                  }}>
                                    {milestone.active ? <Truck size={12} /> : <CheckCircle2 size={12} />}
                                  </div>
                                  {idx < milestones.length - 1 && (
                                    <div style={{
                                      width: '2px',
                                      backgroundColor: milestone.active ? 'var(--info)' : 'var(--border-color)',
                                      flex: 1,
                                      minHeight: '1.25rem',
                                      zIndex: 1,
                                      marginTop: '0.15rem'
                                    }} />
                                  )}
                                </div>
                                <div style={{ paddingTop: '2px' }}>
                                  <strong style={{ fontSize: '0.8125rem', color: milestone.active ? 'var(--text-primary)' : 'var(--text-muted)', display: 'block' }}>
                                    {milestone.title}
                                  </strong>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.05rem' }}>
                                    {milestone.desc}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
