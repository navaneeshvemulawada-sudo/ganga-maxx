import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import quotationService from '../services/quotationService';

export default function QuotationPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

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

  const getStatusBadgeStyles = (status) => {
    switch ((status || 'draft').toLowerCase()) {
      case 'approved':
      case 'accepted':
        return { backgroundColor: 'var(--success-light)', color: 'var(--success)' };
      case 'pending approval':
      case 'sent':
        return { backgroundColor: 'var(--warning-light)', color: 'var(--warning)' };
      case 'rejected':
        return { backgroundColor: 'var(--danger-light)', color: 'var(--danger)' };
      case 'draft':
      default:
        return { backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filtering logic
  const filteredQuotes = quotes.filter(q => {
    // 1. Search filter
    const matchesSearch = 
      (q.quotation_number || q.quote_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.customer_name || '').toLowerCase().includes(search.toLowerCase());
      
    // 2. Status filter
    const matchesStatus = statusFilter === 'All' || (q.status || 'draft').toLowerCase() === statusFilter.toLowerCase();
    
    // 3. Type filter
    const matchesType = typeFilter === 'All' || (q.customer_facility_type || q.institution_type || '').toLowerCase() === typeFilter.toLowerCase();
    
    // 4. Date filter
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const qDate = new Date(q.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - qDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'Last 7 Days') {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'Last 30 Days') {
        matchesDate = diffDays <= 30;
      } else if (dateFilter === 'Last 90 Days') {
        matchesDate = diffDays <= 90;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="animate-fade" style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            QUOTATIONS
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            All Quotations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {filteredQuotes.length} quotation(s) match filters (out of {quotes.length} total)
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{
            height: '42px',
            backgroundColor: '#0f172a',
            color: '#fff',
            borderRadius: '8px',
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
          <Plus size={16} />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-glass" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: 2, minWidth: '220px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Search Quotations</label>
          <input
            type="text"
            placeholder="Search QTN number or Customer..."
            className="form-input"
            style={{ height: '36px', fontSize: '0.8125rem', borderRadius: '6px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <div style={{ flex: 1, minWidth: '130px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Status</label>
          <select
            className="form-input"
            style={{ height: '36px', fontSize: '0.8125rem', borderRadius: '6px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Institution Type */}
        <div style={{ flex: 1.2, minWidth: '150px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Institution Type</label>
          <select
            className="form-input"
            style={{ height: '36px', fontSize: '0.8125rem', borderRadius: '6px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Corporate Office">Corporate Office</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ flex: 1, minWidth: '130px' }}>
          <label style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Created Date</label>
          <select
            className="form-input"
            style={{ height: '36px', fontSize: '0.8125rem', borderRadius: '6px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Main Quotations Table matching screenshot */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading quotations...</span>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>QUOTATION</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CUSTOMER</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEMS</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.slice().reverse().map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => navigate(`/quotations/${quote.id}`)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}
                    className="quotation-row"
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                            {quote.quotation_number || quote.quote_id}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500', marginTop: '0.15rem' }}>
                            {formatDate(quote.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {quote.customer_name}
                      {(quote.customer_facility_type || quote.institution_type) && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '400', marginTop: '2px' }}>
                          {quote.customer_facility_type || quote.institution_type}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {quote.items ? quote.items.length : 8}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyles(quote.status)
                        }}
                      >
                        {(quote.status || 'draft').toLowerCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9375rem', textAlign: 'right' }}>
                      {formatCurrency(quote.total_amount !== undefined ? quote.total_amount : (quote.monthly_cost || 0))}
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No quotations match this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
