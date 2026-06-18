import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Archive, ClipboardList } from 'lucide-react';
import api from '../../services/api';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [inventory, reqs] = await Promise.all([
        api.apiCall('/api/inventory'),
        api.apiCall('/api/requisitions')
      ]);

      const lowStock = inventory.filter(p => p.stock <= p.min_stock);
      setLowStockProducts(lowStock);

      const pendingReqsCount = reqs.filter(r => r.status.toLowerCase() === 'pending').length;

      setMetrics([
        { label: 'Stock Alerts', value: `${lowStock.length} Low Item${lowStock.length === 1 ? '' : 's'}`, icon: ShieldAlert, color: 'var(--danger)', desc: 'Requires replenishment soon' },
        { label: 'Active Teams', value: '3 Crews', icon: Users, color: 'var(--info)', desc: 'Housekeeping personnel online' },
        { label: 'Stock Requests', value: `${pendingReqsCount} Pending`, icon: ClipboardList, color: 'var(--warning)', desc: 'Sent to distribution warehouse' },
      ]);
    } catch (err) {
      console.error('Failed to load supervisor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Welcome back
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          Supervisor Command Centre
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Manage cleaning crews, monitor daily consumable usage, review supply alerts, and dispatch restock sheets.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading supervisor command centre...</span>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.1rem 0', color: m.color === 'var(--danger)' && lowStockProducts.length > 0 ? 'var(--danger)' : 'inherit' }}>{m.value}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layout panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Left Side - Alerts & Requests log */}
            <div className="card-glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>Reorder Warnings</h3>
              {lowStockProducts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No low stock warnings. All cleaning supply levels healthy!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {lowStockProducts.map((item) => (
                    <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>[{item.sku}] {item.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current stock: {item.stock} {item.unit} (Min threshold: {item.min_stock} {item.unit})</span>
                      </div>
                      <span className="badge badge-reorder">
                        Reorder
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Actions */}
            <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.25rem' }}>Inventory Actions</h3>
              
              <button onClick={() => navigate('/supervisor/inventory')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
                <Archive size={16} style={{ color: 'var(--info)', marginRight: '0.5rem' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem' }}>Supplies & stock usage</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>View full list of consumables</span>
                </div>
              </button>

              <button onClick={() => navigate('/supervisor/inventory')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
                <ClipboardList size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem' }}>Request restocks</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Send requisition requests</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
