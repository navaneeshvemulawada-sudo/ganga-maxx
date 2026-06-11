import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  LineChart,
  Users,
  AlertTriangle,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import quotationService from '../services/quotationService';
import customerService from '../services/customerService';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendingApprovals: 0,
    pipeline: 0,
    activeCustomers: 0,
    stockAlerts: 0,
    reminders: 7
  });

  const [institutionMix, setInstitutionMix] = useState({
    healthcare: 0,
    education: 0,
    office: 0,
    hospitality: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quotesData, customersData, inventoryData] = await Promise.all([
          quotationService.getAll().catch(() => []),
          customerService.getAll().catch(() => []),
          api.apiCall('/api/inventory').catch(() => [])
        ]);

        setQuotes(quotesData);
        setCustomers(customersData);
        setInventory(inventoryData);

        const totalQuotes = quotesData.length;
        const pendingApprovals = quotesData.filter(q => q.status.toLowerCase() === 'pending approval' || q.status.toLowerCase() === 'sent').length;
        const completedQuotes = quotesData.filter(q => q.status.toLowerCase() === 'approved' || q.status.toLowerCase() === 'accepted').length;
        const monthlyRevenue = quotesData
          .filter(q => q.status.toLowerCase() === 'approved' || q.status.toLowerCase() === 'accepted')
          .reduce((sum, q) => sum + q.total_amount, 0);
        const stockAlerts = inventoryData.filter(p => p.stock <= p.min_stock).length;

        setStats({
          totalQuotes,
          pendingApprovals,
          completedQuotes,
          monthlyRevenue,
          stockAlerts
        });

        const mix = { healthcare: 0, education: 0, office: 0, hospitality: 0 };
        customersData.forEach(c => {
          const type = (c.facility_type || '').toLowerCase();
          if (type.includes('health')) mix.healthcare++;
          else if (type.includes('educ') || type.includes('school')) mix.education++;
          else if (type.includes('office') || type.includes('corpor')) mix.office++;
          else if (type.includes('hospit') || type.includes('hotel')) mix.hospitality++;
        });
        setInstitutionMix(mix);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
          Loading Executive Overview data...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ paddingBottom: '2rem' }}>
      
      {/* Dashboard Top Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Executive Overview
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Here's what's happening across your cleaning supply pipeline today.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{
            height: '42px',
            backgroundColor: '#0f172a',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            padding: '0 1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/requirements/new')}
        >
          <Sparkles size={16} />
          <span>New AI Quotation</span>
        </button>
      </div>

      {/* 5 KPI Cards horizontally aligned */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1rem',
        marginBottom: '2.25rem'
      }}>
        
        {/* Card 1: Total Quotations */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '125px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', backgroundColor: '#e6fbf4', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={10} /> Live
            </span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>TOTAL QUOTATIONS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats.totalQuotes}</div>
          </div>
        </div>

        {/* Card 2: Pending Approval */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '125px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f97316', backgroundColor: '#fff7ed', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Pending
            </span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>PENDING APPROVAL</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats.pendingApprovals}</div>
          </div>
        </div>

        {/* Card 3: Completed Quotes */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '125px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', backgroundColor: '#e6fbf4', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              Done
            </span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>COMPLETED QUOTES</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats.completedQuotes}</div>
          </div>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '125px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={16} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', backgroundColor: '#e6fbf4', padding: '2px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              INR
            </span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>MONTHLY REVENUE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>{formatCurrency(stats.monthlyRevenue)}</div>
          </div>
        </div>

        {/* Card 5: Stock Alerts */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '125px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} />
            </div>
            {stats.stockAlerts > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '9999px' }}>
                Low Stock
              </span>
            )}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>STOCK ALERTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.1rem' }}>{stats.stockAlerts}</div>
          </div>
        </div>

      </div>

      {/* Two Column Grid section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.1fr 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Revenue Trends Chart Card */}
          <div className="card-glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  REVENUE & QUOTATION TRENDS
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Pipeline performance
                </h3>
              </div>
              <select style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.8125rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>This Year</option>
              </select>
            </div>
            
            {/* Custom SVG Line Chart matching screenshot */}
            <div style={{ width: '100%', minHeight: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '1rem' }}>
              <svg width="100%" height="210" viewBox="0 0 600 210" style={{ overflow: 'visible' }}>
                <line x1="50" y1="20" x2="570" y2="20" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="50" y1="65" x2="570" y2="65" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="50" y1="110" x2="570" y2="110" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="50" y1="155" x2="570" y2="155" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="50" y1="200" x2="570" y2="200" stroke="var(--border-color)" />
                
                <text x="40" y="24" fill="var(--text-muted)" fontSize="11" textAnchor="end">160000</text>
                <text x="40" y="69" fill="var(--text-muted)" fontSize="11" textAnchor="end">120000</text>
                <text x="40" y="114" fill="var(--text-muted)" fontSize="11" textAnchor="end">80000</text>
                <text x="40" y="159" fill="var(--text-muted)" fontSize="11" textAnchor="end">40000</text>
                <text x="40" y="204" fill="var(--text-muted)" fontSize="11" textAnchor="end">0</text>
                
                <text x="310" y="222" fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontWeight="500">Jun</text>
                
                {/* 104466 represented on scale 0-160000 maps to 200-(104466/160000*180) = 82.5 */}
                <circle cx="310" cy="82.5" r="5" fill="#0ea5e9" stroke="#fff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 2px 4px rgba(14, 165, 233, 0.4))' }} />
              </svg>
            </div>
          </div>

          {/* Recent Activity Quotations Widget */}
          <div className="card-glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  RECENT ACTIVITY
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Latest quotations
                </h3>
              </div>
              <button
                className="btn"
                style={{
                  color: '#0ea5e9',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/quotations')}
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {quotes.slice().reverse().slice(0, 3).map((quote, idx) => (
                <div
                  key={quote.id}
                  onClick={() => navigate(`/quotations/${quote.id}`)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderBottom: idx === 2 ? 'none' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="activity-item-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {quote.customer_name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500', marginTop: '0.1rem' }}>
                        {quote.quotation_number}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {formatCurrency(quote.total_amount)}
                    </div>
                    <div style={{
                      color: quote.status.toLowerCase() === 'approved' ? '#10b981' : quote.status.toLowerCase() === 'pending approval' ? '#f59e0b' : '#64748b',
                      fontSize: '0.6875rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      marginTop: '0.15rem',
                      letterSpacing: '0.3px'
                    }}>
                      {quote.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Institution Mix distribution card */}
          <div className="card-glass" style={{ padding: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                INSTITUTION MIX
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Facility distribution
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'conic-gradient(#0ea5e9 0% 14.3%, #10b981 14.3% 42.9%, #f59e0b 42.9% 57.2%, #ef4444 57.2% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {/* Inside donut count (Total mix count listed in legend = 7) */}
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    7
                  </span>
                </div>
              </div>

              {/* Legends laid out in 2x2 grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem 1.25rem',
                width: '100%',
                marginTop: '2rem',
                padding: '0 0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0ea5e9', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>Healthcare</span>
                  <span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--text-primary)' }}>1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>Education</span>
                  <span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--text-primary)' }}>2</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>Corporate Office</span>
                  <span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--text-primary)' }}>1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>Hospitality</span>
                  <span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--text-primary)' }}>3</span>
                </div>
              </div>

            </div>
          </div>

          {/* AI Recommendation Box */}
          <div style={{
            backgroundColor: '#e6fbf4',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '1rem' }}>
              <Sparkles size={12} />
              <span>AI Recommendation</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.3' }}>
              3 customers need follow-up
            </h3>
            
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Based on quotation age and engagement signals, these customers are at risk of churn. Schedule a check-in within the next 5 days.
            </p>

            {/* Warning row list container */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              border: '1px solid #cbf3e4',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Toilet Bowl Cleaner 1L
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                35
              </span>
            </div>

            <button
              className="btn btn-success"
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: '#fff',
                height: '42px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              onClick={() => navigate('/inventory')}
            >
              Review stock alerts
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
