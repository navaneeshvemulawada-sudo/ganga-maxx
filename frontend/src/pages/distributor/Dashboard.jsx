import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Percent, TrendingUp, ArrowUpRight, FileText, Package, Truck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function DistributorDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.apiCall('/api/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders for dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Live metrics calculations
  const activeOrders = orders.filter(o => (o.status || '').toLowerCase() !== 'delivered');
  const totalSpend = orders.reduce((sum, o) => sum + o.total_amount, 0);
  
  // Calculate total items ordered to compute discount tier
  const totalItemsOrdered = orders.reduce((sum, o) => {
    const itemsCount = o.items ? o.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0;
    return sum + itemsCount;
  }, 0);

  const getDiscountTierInfo = (totalQty) => {
    if (totalQty > 500) return { name: 'Platinum', rate: '20% Tier', desc: 'Tier 4 distributor pricing active' };
    if (totalQty > 200) return { name: 'Gold', rate: '15% Tier', desc: 'Tier 3 distributor pricing active' };
    if (totalQty > 50) return { name: 'Silver', rate: '10% Tier', desc: 'Tier 2 distributor pricing active' };
    return { name: 'Bronze', rate: '5% Tier', desc: 'Tier 1 distributor pricing active' };
  };

  const tierInfo = getDiscountTierInfo(totalItemsOrdered);

  const metrics = [
    { label: 'Active Shipments', value: `${activeOrders.length} Active`, icon: ShoppingCart, color: 'var(--accent-primary)', desc: 'Total wholesale orders in transit/processing' },
    { label: 'Dealer Discount', value: tierInfo.rate, icon: Percent, color: 'var(--success)', desc: tierInfo.desc },
    { label: 'Total Purchasing', value: formatCurrency(totalSpend), icon: TrendingUp, color: 'var(--info)', desc: 'Wholesale purchasing this quarter' },
  ];

  const getStatusBadgeStyles = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return { backgroundColor: 'var(--success-light)', color: 'var(--success)' };
      case 'in transit':
        return { backgroundColor: 'var(--info-light)', color: 'var(--info)' };
      case 'processing':
      default:
        return { backgroundColor: 'var(--warning-light)', color: 'var(--warning)' };
    }
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Welcome back
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          Distributor Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Place commercial bulk orders, review customized dealer pricing tiers, and track customer orders.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{
                backgroundColor: 'var(--bg-hover)',
                color: m.color,
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{m.label}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.1rem 0' }}>{m.value}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Layout split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Card: Active Shipments and tracking status */}
        <div className="card-glass" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            Active Shipments & Logistics Tracking
          </h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <span>Loading shipment tracking...</span>
            </div>
          ) : activeOrders.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Truck size={36} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ fontSize: '0.875rem' }}>No active deliveries in transit.</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}
                onClick={() => navigate('/distributor/bulk-orders')}
              >
                Place Bulk Order
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{order.order_number}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                        Carrier: {order.carrier}
                      </span>
                    </div>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        ...getStatusBadgeStyles(order.status)
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div>Items: <strong>{order.items ? order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ') : 'N/A'}</strong></div>
                    <div style={{ marginTop: '2px' }}>Estimated Arrival: <strong style={{ color: 'var(--info)' }}>{order.est_arrival || 'N/A'}</strong></div>
                  </div>

                  {/* Progress Line */}
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px', marginTop: '0.25rem' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'var(--info)' }} />
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: (order.status || '').toLowerCase() !== 'processing' ? 'var(--info)' : 'var(--border-color)' }} />
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-color)' }} />
                  </div>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.8125rem', height: '36px', marginTop: '0.5rem' }}
                onClick={() => navigate('/distributor/bulk-orders')}
              >
                Manage & Place Bulk Orders
              </button>
            </div>
          )}
        </div>

        {/* Right Card: Dealer discounts and Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card-glass" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>Dealer Pricing & Volume Discounts</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your current volume total is <strong>{totalItemsOrdered} units</strong>. Keep ordering to unlock higher discount tiers!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { tier: 'Tier 1 (Bronze)', volume: '1 - 50 items', discount: '5% off', active: tierInfo.name === 'Bronze' },
                { tier: 'Tier 2 (Silver)', volume: '51 - 200 items', discount: '10% off', active: tierInfo.name === 'Silver' },
                { tier: 'Tier 3 (Gold)', volume: '201 - 500 items', discount: '15% off', active: tierInfo.name === 'Gold' },
                { tier: 'Tier 4 (Platinum)', volume: '501+ items', discount: '20% off', active: tierInfo.name === 'Platinum' },
              ].map((t) => (
                <div key={t.tier} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.75rem',
                  backgroundColor: t.active ? 'var(--success-light)' : 'var(--bg-hover)',
                  borderRadius: 'var(--radius-md)',
                  border: t.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                  opacity: t.active ? 1 : 0.75
                }}>
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{t.tier}</strong>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Volume: {t.volume}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: t.active ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>{t.discount}</strong>
                    {t.active && <span style={{ fontSize: '0.6rem', display: 'block', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', marginTop: '1px' }}>Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links card */}
          <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.25rem' }}>Quick Actions</h3>
            
            <button onClick={() => navigate('/distributor/bulk-orders')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
              <ShoppingCart size={16} style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }} />
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.8125rem' }}>Place Bulk Orders</strong>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wholesale chemical orders</span>
              </div>
            </button>

            <button onClick={() => navigate('/quotations')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
              <FileText size={16} style={{ color: 'var(--info)', marginRight: '0.5rem' }} />
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.8125rem' }}>My Quotations</strong>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Download quotation templates</span>
              </div>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
