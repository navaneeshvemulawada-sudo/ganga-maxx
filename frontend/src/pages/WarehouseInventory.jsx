import React, { useState, useEffect } from 'react';
import { Search, Plus, RotateCcw, AlertTriangle, BadgeDollarSign, Archive } from 'lucide-react';
import api from '../services/api';

export default function WarehouseInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restockSku, setRestockSku] = useState(null);
  const [restockAmount, setRestockAmount] = useState('50');
  
  // Add Product State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Chemicals',
    stock: '0',
    min_stock: '0',
    unit: 'pcs',
    unit_price: '0.0',
    location: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.apiCall('/api/inventory');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (product) => {
    try {
      const newStock = product.stock + (parseInt(restockAmount) || 0);
      await api.apiCall(`/api/inventory/${product.id}`, {
        method: 'PUT',
        body: { stock: newStock }
      });
      alert(`Successfully restocked ${product.name}!`);
      setRestockSku(null);
      fetchInventory();
    } catch (err) {
      alert('Failed to restock: ' + err.message);
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      alert('Product name is required.');
      return;
    }

    try {
      await api.apiCall('/api/inventory', {
        method: 'POST',
        body: {
          name: newProduct.name.trim(),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 0,
          min_stock: parseInt(newProduct.min_stock) || 0,
          unit: newProduct.unit,
          unit_price: parseFloat(newProduct.unit_price) || 0.0,
          location: newProduct.location.trim() || 'N/A'
        }
      });
      alert(`Product "${newProduct.name}" added successfully!`);
      setShowAddForm(false);
      setNewProduct({
        name: '',
        category: 'Chemicals',
        stock: '0',
        min_stock: '0',
        unit: 'pcs',
        unit_price: '0.0',
        location: ''
      });
      fetchInventory();
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredProducts = products.filter(p => {
    const term = search.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(term);
    const skuMatch = p.sku?.toLowerCase().includes(term);
    const catMatch = p.category?.toLowerCase().includes(term);
    return nameMatch || skuMatch || catMatch;
  });

  // Calculate metrics
  const totalSKUs = products.length;
  const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unit_price), 0);
  const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Warehouse Inventory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Inspect active supply items stock levels, locations, and pricing variables.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ height: '40px', gap: '0.25rem' }} onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
          
          <button className="btn btn-secondary" style={{ height: '40px', gap: '0.25rem' }} onClick={fetchInventory}>
            <RotateCcw size={16} />
            <span>Reload Live Stock</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card-glass animate-fade" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Register New Product SKU
          </h3>
          <form onSubmit={handleAddProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Description Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Heavy Duty Toilet Brush"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.name}
                  onChange={handleAddInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-input"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.category}
                  onChange={handleAddInputChange}
                >
                  <option>Chemicals</option>
                  <option>Accessories</option>
                  <option>Consumables</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  placeholder="e.g. L, pcs, pack, box"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.unit}
                  onChange={handleAddInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Initial Stock Level</label>
                <input
                  type="number"
                  name="stock"
                  className="form-input"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.stock}
                  onChange={handleAddInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Min Stock Threshold</label>
                <input
                  type="number"
                  name="min_stock"
                  className="form-input"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.min_stock}
                  onChange={handleAddInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="unit_price"
                  className="form-input"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.unit_price}
                  onChange={handleAddInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Warehouse Aisle Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Aisle B4"
                  style={{ height: '36px', borderRadius: '6px' }}
                  value={newProduct.location}
                  onChange={handleAddInputChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" style={{ height: '36px' }} onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ height: '36px' }}>
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        
        {/* Total SKUs */}
        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Archive size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Products SKUs
            </span>
            <h3 style={{ fontSize: '1.625rem', fontWeight: '800', margin: '0.1rem 0' }}>
              {totalSKUs}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Catalog items registered</span>
          </div>
        </div>

        {/* Valuation */}
        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BadgeDollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Stock Valuation
            </span>
            <h3 style={{ fontSize: '1.625rem', fontWeight: '800', margin: '0.1rem 0' }}>
              {formatCurrency(inventoryValue)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Valued at wholesale cost</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            backgroundColor: lowStockCount > 0 ? 'var(--danger-light)' : 'var(--success-light)',
            color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Low Stock Alerts
            </span>
            <h3 style={{ fontSize: '1.625rem', fontWeight: '800', margin: '0.1rem 0', color: lowStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {lowStockCount}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {lowStockCount > 0 ? 'Requires vendor ordering' : 'No low stock warnings'}
            </span>
          </div>
        </div>

      </div>

      {/* Search Bar filter */}
      <div style={{ position: 'relative', width: '320px', marginBottom: '1.5rem' }}>
        <Search size={16} style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} />
        <input
          type="text"
          placeholder="Filter catalog by name, SKU, or category..."
          className="form-input"
          style={{
            paddingLeft: '32px',
            height: '38px',
            fontSize: '0.75rem'
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Warehouse items list table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading warehouse items...</span>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Product Consumable Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Stock Level</th>
                  <th style={{ textAlign: 'center' }}>Min Stock</th>
                  <th>Unit Price</th>
                  <th>Warehouse Aisle</th>
                  <th>Status Check</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Refill</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isLow = p.stock <= p.min_stock;
                  const isRestocking = restockSku === p.sku;
                  
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.sku}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {p.name}
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: isLow ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {p.stock} {p.unit}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {p.min_stock} {p.unit}
                      </td>
                      <td style={{ fontWeight: '500' }}>{formatCurrency(p.unit_price)}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{p.location || 'N/A'}</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-reorder' : 'badge-healthy'}`}>
                          {isLow ? 'Reorder' : 'Healthy'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isRestocking ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '60px', height: '28px', padding: '2px', fontSize: '0.75rem', textAlign: 'center' }}
                              value={restockAmount}
                              onChange={(e) => setRestockAmount(e.target.value)}
                            />
                            <button
                              className="btn btn-success"
                              style={{ padding: '2px 6px', height: '28px', fontSize: '0.7rem' }}
                              onClick={() => handleRestock(p)}
                            >
                              Go
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '2px 6px', height: '28px', fontSize: '0.7rem' }}
                              onClick={() => setRestockSku(null)}
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', height: '28px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setRestockSku(p.sku);
                              setRestockAmount('50');
                            }}
                          >
                            Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
