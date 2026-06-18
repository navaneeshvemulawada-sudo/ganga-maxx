import React, { useState, useEffect } from 'react';
import { Archive, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function SupervisorInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestItem, setRequestItem] = useState(null);
  const [requestQty, setRequestQty] = useState('10');

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

  const handleRequestSend = async (product) => {
    try {
      const qty = parseInt(requestQty, 10);
      if (isNaN(qty) || qty <= 0) {
        alert('Please enter a valid positive quantity.');
        return;
      }
      await api.apiCall('/api/requisitions', {
        method: 'POST',
        body: {
          product_sku: product.sku,
          product_name: product.name,
          qty: qty
        }
      });
      alert(`Requisition of ${qty} unit(s) of "${product.name}" has been submitted successfully.`);
      setRequestItem(null);
      fetchInventory();
    } catch (err) {
      alert(`Failed to submit requisition: ${err.message}`);
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            SUPPLIES MANAGEMENT
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
            Cleaning Supplies & Inventory Usage
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Inspect active supply items stock levels, locations, and request restocks.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading supply inventory...</span>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Product Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Stock Level</th>
                  <th style={{ textAlign: 'center' }}>Min Stock</th>
                  <th>Warehouse Aisle</th>
                  <th>Status Check</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>Restock Request</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.stock <= p.min_stock;
                  const isRequesting = requestItem === p.sku;
                  
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{p.sku}</td>
                      <td style={{ fontWeight: '600' }}>{p.name}</td>
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
                      <td>{p.location || 'N/A'}</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-reorder' : 'badge-healthy'}`}>
                          {isLow ? 'Reorder' : 'Healthy'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isRequesting ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '60px', height: '28px', padding: '2px', fontSize: '0.75rem', textAlign: 'center' }}
                              value={requestQty}
                              onChange={(e) => setRequestQty(e.target.value)}
                            />
                            <button className="btn btn-success" style={{ padding: '2px 6px', height: '28px', fontSize: '0.7rem' }} onClick={() => handleRequestSend(p)}>
                              Send
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '2px 6px', height: '28px', fontSize: '0.7rem' }} onClick={() => setRequestItem(null)}>
                              X
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '4px 10px', height: '28px', fontSize: '0.75rem' }} onClick={() => {
                            setRequestItem(p.sku);
                            setRequestQty('10');
                          }}>
                            Request Restock
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
