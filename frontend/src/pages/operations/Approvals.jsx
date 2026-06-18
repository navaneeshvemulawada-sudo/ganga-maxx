import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, X, Eye, ClipboardList } from 'lucide-react';
import quotationService from '../../services/quotationService';
import api from '../../services/api';

export default function OperationsApprovals() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [activeTab, setActiveTab] = useState('quotations'); // 'quotations' or 'requisitions'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial counts for both tabs
    fetchPendingQuotations(false);
    fetchPendingRequisitions(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'quotations') {
      fetchPendingQuotations(true);
    } else {
      fetchPendingRequisitions(true);
    }
  }, [activeTab]);

  const fetchPendingQuotations = async (setLoadState = true) => {
    try {
      if (setLoadState) setLoading(true);
      const data = await quotationService.getAll();
      const pending = data.filter(q => q.status.toLowerCase() === 'pending approval');
      setQuotes(pending);
    } catch (err) {
      console.error('Failed to load pending quotations:', err);
    } finally {
      if (setLoadState) setLoading(false);
    }
  };

  const fetchPendingRequisitions = async (setLoadState = true) => {
    try {
      if (setLoadState) setLoading(true);
      const data = await api.apiCall('/api/requisitions');
      const pending = data.filter(r => r.status.toLowerCase() === 'pending');
      setRequisitions(pending);
    } catch (err) {
      console.error('Failed to load pending requisitions:', err);
    } finally {
      if (setLoadState) setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await quotationService.update(id, { status: newStatus });
      alert(`Quotation ${newStatus} successfully!`);
      fetchPendingQuotations(true);
    } catch (err) {
      alert('Failed to update quotation status: ' + err.message);
    }
  };

  const handleRequisitionStatusUpdate = async (id, status) => {
    try {
      await api.apiCall(`/api/requisitions/${id}/status`, {
        method: 'PUT',
        body: { status }
      });
      alert(`Requisition ${status} successfully!`);
      fetchPendingRequisitions(true);
    } catch (err) {
      alert(`Failed to update requisition status: ${err.message}`);
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          CONTRACT MANAGEMENT
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          Quotation & Supplies Approvals
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Review and digitally sign off on pending commercial supply contracts and supervisor restocking requisitions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('quotations')} 
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'quotations' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'quotations' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'quotations' ? '700' : '500',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Quotation Approvals ({quotes.length})
        </button>
        <button 
          onClick={() => setActiveTab('requisitions')} 
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requisitions' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'requisitions' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'requisitions' ? '700' : '500',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Supervisor Requisitions ({requisitions.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span>Loading pending approvals...</span>
        </div>
      ) : activeTab === 'quotations' ? (
        quotes.length === 0 ? (
          <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={48} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.7 }} />
            <h3>All Clear!</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>No quotation contracts are currently awaiting approval.</p>
          </div>
        ) : (
          <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Quotation Number</th>
                    <th>Customer Institution</th>
                    <th>Total Amount</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'center', width: '280px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{q.quotation_number}</td>
                      <td style={{ fontWeight: '600' }}>{q.customer_name}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(q.total_amount)}</td>
                      <td>{new Date(q.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button onClick={() => navigate(`/quotations/${q.id}`)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <Eye size={12} />
                            Review
                          </button>
                          <button onClick={() => handleStatusUpdate(q.id, 'approved')} className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <Check size={12} />
                            Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(q.id, 'rejected')} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        requisitions.length === 0 ? (
          <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={48} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.7 }} />
            <h3>All Clear!</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>No restock requisitions are currently awaiting approval.</p>
          </div>
        ) : (
          <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Requisition ID</th>
                    <th>Supervisor</th>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Requested Qty</th>
                    <th style={{ textAlign: 'center', width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.id}</td>
                      <td style={{ fontWeight: '600' }}>{r.supervisor}</td>
                      <td>{r.product_name}</td>
                      <td>{r.product_sku}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.qty}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button onClick={() => handleRequisitionStatusUpdate(r.id, 'approved')} className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <Check size={12} />
                            Approve
                          </button>
                          <button onClick={() => handleRequisitionStatusUpdate(r.id, 'rejected')} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '2px' }}>
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
