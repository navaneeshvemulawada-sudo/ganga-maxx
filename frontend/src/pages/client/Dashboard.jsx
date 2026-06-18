import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Truck, RefreshCw, FilePlus, User, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import authService from '../../services/authService';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser() || {};
      
      // Fetch Quotations, Orders, and Customers
      const [quotesData, ordersData, customersData] = await Promise.all([
        api.apiCall('/api/quotations'),
        api.apiCall('/api/orders'),
        api.apiCall('/api/customers')
      ]);

      setQuotes(quotesData);
      setOrders(ordersData);

      // Find matching customer
      const matched = customersData.find(c => 
        (c.email && c.email.toLowerCase() === user.email?.toLowerCase()) || 
        (c.name && c.name.toLowerCase().includes(user.username?.toLowerCase())) ||
        (c.company && c.company.toLowerCase().includes(user.username?.toLowerCase()))
      ) || customersData[0] || {
        name: 'Test University',
        company: 'Test Educational Trust',
        area: 15000,
        facility_type: 'Hospitality',
        address: 'Bengaluru Main Campus'
      };
      setFacility(matched);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
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

  // Calculations
  const activeShipments = orders.filter(o => o.status !== 'Delivered').length;
  const pendingReorders = quotes.filter(q => q.status?.toLowerCase() === 'pending approval' || q.status?.toLowerCase() === 'draft').length;

  const metrics = [
    { label: 'My Quotations', value: `${quotes.length} Saved`, icon: FileText, color: 'var(--accent-primary)', desc: 'Active pricing proposals' },
    { label: 'Shipments en Route', value: `${activeShipments} Shipment${activeShipments === 1 ? '' : 's'}`, icon: Truck, color: 'var(--info)', desc: 'In Transit / Processing' },
    { label: 'Reorder Requests', value: `${pendingReorders} Pending`, icon: RefreshCw, color: 'var(--warning)', desc: 'Supplies restock status' },
  ];

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Welcome back
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          Client Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Generate custom cleaning product quotes, request reorders, and check active logistics pipelines.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading client metrics...</span>
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.1rem 0' }}>{m.value}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Panel */}
          <div className="card-glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>Quick Workflows</h3>
            <div className="grid-cols-3">
              <button onClick={() => navigate('/requirements/new')} className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', height: 'auto', textAlign: 'center' }}>
                <FilePlus size={28} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>New Quotation Wizard</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Configure space requirements and get pricing</span>
                </div>
              </button>

              <button onClick={() => navigate('/client/quotations')} className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', height: 'auto', textAlign: 'center' }}>
                <FileText size={28} style={{ color: 'var(--success)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>Quotation History</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View, print, and approve historical quotes</span>
                </div>
              </button>

              <button onClick={() => navigate('/client/delivery')} className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', height: 'auto', textAlign: 'center' }}>
                <Truck size={28} style={{ color: 'var(--info)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>Track Shipments</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Check dispatcher and courier timelines</span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem' }}>
            {/* Recent Activity */}
            <div className="card-glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem' }}>Active Proposals & Status</h3>
              {quotes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No quotations created yet. Click "New Quotation Wizard" to start.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {quotes.slice(0, 3).map((q) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{q.quotation_number || q.quote_id} - {q.customer_name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created on: {new Date(q.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>{formatCurrency(q.total_amount !== undefined ? q.total_amount : (q.monthly_cost || 0))}</strong>
                        <span className={`badge ${(q.status || 'draft').toLowerCase() === 'approved' || (q.status || 'draft').toLowerCase() === 'accepted' ? 'badge-approved' : (q.status || 'draft').toLowerCase() === 'draft' ? 'badge-draft' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                          {q.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>Facility Profile</span>
                </h3>
                {facility && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Company Name:</span>
                      <span style={{ fontWeight: '600' }}>{facility.company || facility.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Facility Area:</span>
                      <span style={{ fontWeight: '600' }}>{facility.area ? `${facility.area.toLocaleString()} sq ft` : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                      <span style={{ fontWeight: '600' }}>{facility.address || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--warning-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.1)', marginTop: '1rem' }}>
                <AlertCircle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Next audit scheduling: July 2026</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
