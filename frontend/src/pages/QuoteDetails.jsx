import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Save,
  Check,
  X,
  Share2,
  Download,
  Printer,
  ChevronLeft,
  Trash2,
  Building,
  UserCheck
} from 'lucide-react';
import quotationService from '../services/quotationService';
import authService from '../services/authService';

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItems, setEditingItems] = useState([]);
  const [taxRate, setTaxRate] = useState(18.0);
  const [discount, setDiscount] = useState(0.0);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const user = authService.getCurrentUser() || { role: 'sales' };

  useEffect(() => {
    fetchQuoteDetails();
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getById(id);
      setQuote(data);
      setEditingItems(data.items.map(item => ({ ...item })));
      setTaxRate(data.tax_rate);
      setDiscount(data.discount);
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Failed to fetch quotation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index, value) => {
    const qty = parseInt(value) || 0;
    setEditingItems(prev => {
      const updated = [...prev];
      updated[index].quantity = qty >= 0 ? qty : 0;
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
      return updated;
    });
  };

  const handleDeleteItem = (index) => {
    if (editingItems.length <= 1) {
      alert('Quotation must contain at least one item.');
      return;
    }
    setEditingItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Live calculations for editing session
  const liveSubtotal = editingItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const liveTaxAmount = liveSubtotal * (taxRate / 100.0);
  const liveTotalAmount = Math.max(liveSubtotal + liveTaxAmount - discount, 0);

  const handleSaveWorkspace = async () => {
    try {
      setSaving(true);
      const payload = {
        tax_rate: taxRate,
        discount: discount,
        notes: notes,
        items: editingItems.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      await quotationService.update(id, payload);
      alert('Quotation workspace changes saved successfully!');
      fetchQuoteDetails();
    } catch (err) {
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      await quotationService.update(id, { status: newStatus });
      alert(`Quotation status changed to "${newStatus}"!`);
      fetchQuoteDetails();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!quote) return;
    const headers = ['Product Name', 'Quantity', 'Unit Price', 'Line Total'];
    const rows = editingItems.map(item => [
      `"${item.product_name}"`,
      item.quantity,
      item.unit_price,
      item.quantity * item.unit_price
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Quotation_${quote.quotation_number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard! Share it with procurement partners.');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'badge-approved';
      case 'pending approval': return 'badge-pending';
      case 'draft': return 'badge-draft';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-draft';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span>Loading quotation details workspace...</span>
      </div>
    );
  }

  if (!quote) return <div style={{ padding: '2rem', textAlign: 'center' }}>Quotation not found.</div>;

  const canApprove = user.role === 'admin' || user.role === 'manager';
  const isDraftOrRejected = quote.status === 'draft' || quote.status === 'rejected';

  return (
    <div className="animate-fade">
      {/* Print-Only Header Block */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>CleanBundle</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Supply Chain Quotation Statement</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>{quote.quotation_number}</h2>
            <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0.25rem 0 0 0' }}>Date: {new Date(quote.created_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Supplier Details</h4>
            <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>CleanBundle India Ltd.</strong>
            <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>Warehouse Block C, Tech Zone<br/>Bengaluru, Karnataka - 560001</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Customer Details</h4>
            <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>{quote.customer_name}</strong>
            <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>Facility Type: {quote.customer_facility_type || 'N/A'}<br/>Valid Until: {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-IN') : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Top Header details */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }} className="no-print">
        {/* Back navigation */}
        <button
          className="btn btn-secondary"
          style={{ height: '40px', gap: '0.25rem' }}
          onClick={() => navigate('/quotations')}
        >
          <ChevronLeft size={16} />
          <span>Back to Database</span>
        </button>

        {/* Action button workflows */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={handleShareLink} title="Share Link">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={handleExportCSV} title="Export CSV">
            <Download size={16} />
            <span>CSV</span>
          </button>

          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={handlePrint} title="Print PDF">
            <Printer size={16} />
            <span>Print</span>
          </button>

          {isDraftOrRejected && (
            <button
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
              onClick={() => handleUpdateStatus('pending approval')}
              disabled={saving}
            >
              <span>Submit for Approval</span>
            </button>
          )}

          {quote.status === 'pending approval' && canApprove && (
            <>
              <button
                className="btn btn-success"
                style={{ gap: '0.5rem' }}
                onClick={() => handleUpdateStatus('approved')}
                disabled={saving}
              >
                <Check size={16} />
                <span>Approve Contract</span>
              </button>
              <button
                className="btn btn-danger"
                style={{ gap: '0.5rem' }}
                onClick={() => handleUpdateStatus('rejected')}
                disabled={saving}
              >
                <X size={16} />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details summary & line items table */}
      <div className="quotation-grid-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Side: Line Items Table */}
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Supply Line Items</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure quantities and review price calculations</p>
            </div>
            
            <button
              className="btn btn-primary"
              style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.75rem', gap: '0.25rem' }}
              onClick={handleSaveWorkspace}
              disabled={saving}
            >
              <Save size={14} />
              <span>Save Workspace Changes</span>
            </button>
          </div>

          <div className="print-only" style={{ padding: '1.25rem 1.5rem 0.5rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', borderBottom: '1px solid #000000', paddingBottom: '0.25rem' }}>Supply Line Items</h3>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Consumable Description</th>
                  <th style={{ width: '120px' }}>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th className="no-print" style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {editingItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.product_name}
                    </td>
                    <td>
                      <span className="print-only" style={{ fontWeight: '700' }}>{item.quantity}</span>
                      <input
                        type="number"
                        className="form-input no-print"
                        style={{ height: '32px', padding: '2px 8px', fontSize: '0.8125rem' }}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        disabled={quote.status === 'approved'}
                      />
                    </td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', height: '28px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleDeleteItem(index)}
                        disabled={quote.status === 'approved'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Proposal Notes section */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>AI Proposal Notes & Comments</span>
            </h3>
            <p className="no-print" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Specific recommendations and guidelines generated for this customer contract statement.
            </p>
            <p className="print-only" style={{ fontSize: '0.875rem', color: '#000000', marginTop: '0.5rem', whiteSpace: 'pre-wrap', fontWeight: '500', lineHeight: '1.5' }}>
              {notes || 'No proposal notes/comments provided.'}
            </p>
            <textarea
              className="form-input no-print"
              style={{
                width: '100%',
                height: '90px',
                fontSize: '0.8125rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: quote.status === 'approved' ? 'var(--bg-hover)' : 'var(--bg-secondary)'
              }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={quote.status === 'approved'}
              placeholder="Enter proposal notes or comments..."
            />
          </div>
        </div>

        {/* Right Side: Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Quotation Profile details */}
          <div className="card-glass no-print">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Contract Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Quotation Code:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{quote.quotation_number}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                <span className={`badge ${getStatusBadgeClass(quote.status)}`} style={{ float: 'right' }}>
                  {quote.status}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer Institution:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {quote.customer_name}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Valid Until:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>
                  {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-IN') : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          {/* Card 2: Financial pricing summaries */}
          <div className="card-glass" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Financial Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{formatCurrency(liveSubtotal)}</strong>
              </div>
              
              {/* Tax rate edit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax Rate (GST %):</span>
                <span className="print-only" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{taxRate}%</span>
                <input
                  type="number"
                  className="form-input no-print"
                  style={{ width: '60px', height: '26px', padding: '2px', textAlign: 'center', fontSize: '0.75rem' }}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  disabled={quote.status === 'approved'}
                />
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tax Amount:</span>
                <strong style={{ float: 'right', color: 'var(--text-primary)' }}>{formatCurrency(liveTaxAmount)}</strong>
              </div>

              {/* Discount edit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Flat Discount (₹):</span>
                <span className="print-only" style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(discount)}</span>
                <input
                  type="number"
                  className="form-input no-print"
                  style={{ width: '85px', height: '26px', padding: '2px', textAlign: 'center', fontSize: '0.75rem' }}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  disabled={quote.status === 'approved'}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem' }}>Net Amount:</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {formatCurrency(liveTotalAmount)}
              </strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
