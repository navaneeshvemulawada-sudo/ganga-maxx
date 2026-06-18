import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, BarChart3, Clock, Sparkles, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import quotationService from '../../services/quotationService';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [quotes, reqs, customers] = await Promise.all([
        quotationService.getAll(),
        api.apiCall('/api/requisitions'),
        api.apiCall('/api/customers')
      ]);

      const pendingQuotesCount = quotes.filter(q => (q.status || 'draft').toLowerCase() === 'pending approval').length;
      const pendingReqsCount = reqs.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const totalCustomersCount = customers.length;

      setMetrics([
        { label: 'Registered Facilities', value: `${totalCustomersCount} Active`, icon: Building, color: 'var(--accent-primary)', desc: 'Total institutional clients' },
        { label: 'Pending Approvals', value: `${pendingQuotesCount} Contract${pendingQuotesCount === 1 ? '' : 's'}`, icon: Clock, color: 'var(--warning)', desc: 'Awaiting digital sign-off' },
        { label: 'Restock Requisitions', value: `${pendingReqsCount} Request${pendingReqsCount === 1 ? '' : 's'}`, icon: ClipboardList, color: 'var(--success)', desc: 'Supervisor supply orders' },
      ]);
    } catch (err) {
      console.error('Failed to fetch operations dashboard metrics:', err);
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
          Operations Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Create facility requirements, manage schedules, approve pending contracts, and audit chemical consumption rates.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading operations metrics...</span>
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

          {/* Main layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* left card: Monthly consumption chart representation */}
            <div className="card-glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.25rem' }}>Consumables Consumption Ratio</h3>
              
              <div className="donut-container">
                <div className="donut-pie" style={{
                  background: 'conic-gradient(var(--accent-primary) 0% 50%, var(--success) 50% 80%, var(--warning) 80% 100%)'
                }}>
                  <div className="donut-hole">
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'block' }}>540L</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Used this month</span>
                    </div>
                  </div>
                </div>

                <div className="donut-legends">
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ backgroundColor: 'var(--accent-primary)' }} />
                    <span>Chemicals: <strong>270L</strong> (50%)</span>
                  </div>
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ backgroundColor: 'var(--success)' }} />
                    <span>Sanitizers: <strong>162L</strong> (30%)</span>
                  </div>
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ backgroundColor: 'var(--warning)' }} />
                    <span>Accessories: <strong>108L</strong> (20%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right card: quick link buttons */}
            <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.25rem' }}>Operational Control</h3>
              
              <button onClick={() => navigate('/requirements/new')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
                <Building size={16} style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem' }}>Create Facility Requirements</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Input cleaning area variables for bulk quotes</span>
                </div>
              </button>

              <button onClick={() => navigate('/recommend')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
                <Sparkles size={16} style={{ color: 'var(--info)', marginRight: '0.5rem' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem' }}>AI Bundle Recommendations</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Review auto-selected supply list</span>
                </div>
              </button>

              <button onClick={() => navigate('/operations/approvals')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)', marginRight: '0.5rem' }} />
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem' }}>Quotation & Supplies Approvals</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approve pending contracts and supervisor restocks</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
