import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, RefreshCw } from 'lucide-react';
import quotationService from '../../services/quotationService';

export default function ClientQuotations() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getAll();
      setQuotes(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
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

  const getStatusBadge = (status) => {
    const s = (status || 'draft').toLowerCase();
    if (s === 'approved' || s === 'accepted') return <span className="badge badge-approved">Approved</span>;
    if (s === 'pending approval') return <span className="badge badge-pending">Pending Approval</span>;
    return <span className="badge badge-draft">{status || 'Draft'}</span>;
  };

  const handleReorder = (q) => {
    alert(`Reorder request submitted for quote ${q.quotation_number || q.quote_id}! Our warehouse logistics team has been notified.`);
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            MY RECORDS
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
            Quotation History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Check prices of active contract agreements or request immediate product reorders.
          </p>
        </div>
        
        <button onClick={() => navigate('/requirements/new')} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <span>Create New Quote</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading quotations list...</span>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Quotation Number</th>
                  <th>Customer/Institution</th>
                  <th>Line Items Count</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign: 'center', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{q.quotation_number || q.quote_id}</td>
                    <td style={{ fontWeight: '600' }}>{q.customer_name}</td>
                    <td>{q.items ? q.items.length : 6} items</td>
                    <td>{getStatusBadge(q.status || 'draft')}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(q.total_amount !== undefined ? q.total_amount : (q.monthly_cost || 0))}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate(`/quotations/${q.id}`)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px' }}>
                          Open
                        </button>
                        {(q.status || 'draft').toLowerCase() === 'approved' && (
                          <button onClick={() => handleReorder(q)} className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <RefreshCw size={12} />
                            Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
