import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Leaf,
  Settings,
  ChevronRight,
  TrendingDown,
  Building,
  Check
} from 'lucide-react';
import customerService from '../services/customerService';
import quotationService from '../services/quotationService';

export default function AIRecommendation() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState(null);
  const [recs, setRecs] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [building, setBuilding] = useState(false);
  const [proposalNotes, setProposalNotes] = useState('');
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    // Read selections from session
    const savedInputs = sessionStorage.getItem('wizard_inputs');
    const savedRecs = sessionStorage.getItem('ai_recommendation');

    if (!savedInputs || !savedRecs) {
      setHasData(false);
      return;
    }

    setHasData(true);
    const parsedInputs = JSON.parse(savedInputs);
    const parsedRecs = JSON.parse(savedRecs);

    setInputs(parsedInputs);
    setRecs(parsedRecs);

    setProposalNotes(
      `AI-generated recommendation suite custom-designed for ${parsedInputs.name}. ` +
      `This tailored package aligns with the specifications of a ${parsedInputs.facility_type} facility ` +
      `spanning ${parseInt(parsedInputs.area || 0).toLocaleString()} sqft, operating on a ${parsedInputs.cleaning_frequency} cleaning cycle. ` +
      `Facility specifications (Staff: ${parsedInputs.staff_count}, Washrooms: ${parsedInputs.num_washrooms || 'N/A'}, Daily Visitors: ${parsedInputs.daily_visitors || 'N/A'}) ` +
      `and compliance requirements have been factored into the optimization model.`
    );

    // Default select all items and copy quantities
    const itemsSelection = {};
    const itemsQuantities = {};
    parsedRecs.items.forEach(item => {
      itemsSelection[item.sku] = true;
      itemsQuantities[item.sku] = item.quantity;
    });

    setSelectedItems(itemsSelection);
    setQuantities(itemsQuantities);
  }, [navigate]);

  if (!hasData) {
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-primary)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          No Active Recommendation Session
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '460px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Please complete the New Requirement Wizard first. The AI bundle recommendation engine requires facility specifications to forecast cleaning supplies correctly.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/requirements/new')}>
          Start Requirement Wizard
        </button>
      </div>
    );
  }

  if (!inputs || !recs) return null;

  const handleCheckboxToggle = (sku) => {
    setSelectedItems(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
  };

  const handleQuantityChange = (sku, val) => {
    const qty = parseInt(val) || 0;
    setQuantities(prev => ({
      ...prev,
      [sku]: qty >= 0 ? qty : 0
    }));
  };

  // Compute live subtotal dynamically based on selected checkboxes and quantities
  const activeItems = recs.items.filter(item => selectedItems[item.sku]);
  const liveSubtotal = activeItems.reduce((sum, item) => {
    const qty = quantities[item.sku] !== undefined ? quantities[item.sku] : item.quantity;
    return sum + (qty * item.unit_price);
  }, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMonthlyUsage = (sku, qty) => {
    switch (sku) {
      case 'FL-012':
        return `Dilution ratio 1:100 (approx. ${qty * 500} buckets)`;
      case 'TR-005':
        return `Dilution ratio 1:50 (approx. ${qty * 50} bowls)`;
      case 'GL-002':
        return `Ready-to-use spray (${qty} refills/month)`;
      case 'MP-088':
        return `Dilution ratio 1:120 (approx. ${qty * 600} cleanings)`;
      case 'TB-105':
        return `Usage: approx. ${(qty * 50)} bins/month`;
      case 'HS-045':
        return `Usage: approx. ${(qty * 1000)} hand washes`;
      case 'NG-099':
        return `Usage: approx. ${(qty * 100)} pairs/month`;
      case 'BS-077':
        return `Usage: approx. ${(qty * 50)} bio bags/month`;
      case 'MC-022':
        return `Usage: ${(qty * 4)} reusable cloths`;
      case 'WM-033':
        return `Usage: ${(qty)} mop heads/month`;
      default:
        return `Usage: ${qty} units per month`;
    }
  };

  const handleBuildQuotation = async () => {
    try {
      setBuilding(true);
      let customerId = inputs.customerId;

      // 1. If no customer ID is selected, create the customer first!
      if (!customerId) {
        const health_score = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
        const newCust = await customerService.create({
          name: inputs.name,
          email: inputs.email || `${inputs.name.toLowerCase().replace(/\s+/g, '')}@cleanbundle.ai`,
          phone: inputs.phone,
          company: inputs.contactName || inputs.name,
          address: inputs.address,
          facility_type: inputs.facility_type,
          floors: parseInt(inputs.floors) || 1,
          staff: parseInt(inputs.staff_count) || 0,
          area: parseInt(inputs.area) || 0,
          health_score,
          compliance: (inputs.compliance || []).join(', '),
          cleaning_frequency: inputs.cleaning_frequency,
          num_washrooms: parseInt(inputs.num_washrooms) || 0,
          daily_visitors: parseInt(inputs.daily_visitors) || 0,
          preferred_schedule: inputs.preferred_schedule,
          current_supplier: inputs.current_supplier,
          monthly_budget: parseFloat(inputs.monthly_budget) || 0
        });
        customerId = newCust.id;
      }

      // 2. Prepare quotation items payload
      const quotationItems = activeItems.map(item => ({
        product_name: item.name,
        quantity: quantities[item.sku] !== undefined ? quantities[item.sku] : item.quantity,
        unit_price: item.unit_price
      })).filter(item => item.quantity > 0);

      if (quotationItems.length === 0) {
        alert('Quotation must contain at least one item with quantity > 0.');
        setBuilding(false);
        return;
      }

      // 3. Create the quotation
      const quotePayload = {
        customer_id: customerId,
        tax_rate: 18.0, // Default tax GST percentage
        discount: 0.0,
        valid_days: 30,
        items: quotationItems,
        status: 'draft', // starts as draft
        notes: proposalNotes
      };

      const quotation = await quotationService.create(quotePayload);
      
      // Clean wizard session data
      sessionStorage.removeItem('wizard_inputs');
      sessionStorage.removeItem('ai_recommendation');

      // Show success or warning message based on webhook response
      if (quotation.webhook_success === false) {
        alert(quotation.message || 'Quotation was created successfully, but the email could not be sent.');
      } else {
        alert(quotation.message || 'Quotation created and emailed successfully!');
      }

      // Navigate to quotations details page
      navigate(`/quotations/${quotation.id}`);
    } catch (err) {
      alert('Failed to build quotation: ' + err.message);
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="animate-fade">
      
      {/* Top Header widgets */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            AI Supply Chain Recommendation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Tailored supply recommendations based on facility criteria and regulations checks.
          </p>
        </div>
        <button
          className="btn btn-success"
          style={{ height: '42px', gap: '0.5rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' }}
          onClick={handleBuildQuotation}
          disabled={building}
        >
          <Check size={16} />
          <span>{building ? 'Building Quotation...' : 'Build Draft Quotation'}</span>
        </button>
      </div>

      {/* Summary message banner */}
      <div style={{
        backgroundColor: 'var(--accent-light)',
        borderLeft: '4px solid var(--accent-primary)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Sparkles size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span>{recs.summary_text}</span>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        
        {/* Estimated Pricing */}
        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Estimated Subtotal
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.25rem 0 0 0', color: 'var(--accent-primary)' }}>
            {formatCurrency(liveSubtotal)}
          </h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Excludes 18% GST and custom discounts</span>
        </div>

        {/* AI Confidence */}
        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            AI Confidence
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.25rem 0 0 0', color: 'var(--success)' }}>
            {recs.confidence_score}%
          </h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>High correlation with facility type</span>
        </div>

        {/* Sustainability Index */}
        <div className="card-glass" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Green Sustainability
            </span>
            <Leaf size={14} style={{ color: 'var(--success)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.25rem 0 0 0', color: 'var(--success)' }}>
            {recs.eco_percentage}% Eco
          </h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Eco-label certified chemicals</span>
        </div>

        {/* Cost Optimization */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning)',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingDown size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
              Bulk Optimization
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', lineHeight: '1.2' }}>
              Bulk 5L sizing applied
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Saves ₹2,400 monthly</span>
          </div>
        </div>

      </div>

      {/* Recommended Items table */}
      <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Consumable Inventory Recommendations</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Check/uncheck items or adjust quantities to refine the final quotation contract
          </p>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>Select</th>
                <th>Product Information</th>
                <th>Category</th>
                <th>Stock Status</th>
                <th style={{ width: '120px' }}>Quantity</th>
                <th>Monthly Usage Info</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {recs.items.map(item => {
                const isChecked = selectedItems[item.sku];
                const qty = quantities[item.sku] !== undefined ? quantities[item.sku] : item.quantity;
                const isLowStock = item.stock <= item.min_stock;
                
                return (
                  <tr key={item.sku} style={{ opacity: isChecked ? 1 : 0.6 }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(item.sku)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                        </div>
                        {item.eco_friendly && (
                          <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontSize: '0.6rem', gap: '0.15rem' }}>
                            <Leaf size={10} />
                            <span>Eco</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isLowStock ? 'badge-reorder' : 'badge-healthy'}`}>
                        {isLowStock ? 'Reorder Warning' : 'Healthy Stock'}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: '32px', padding: '2px 8px', width: '80px', fontSize: '0.8125rem' }}
                        value={qty}
                        onChange={(e) => handleQuantityChange(item.sku, e.target.value)}
                        disabled={!isChecked}
                      />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {getMonthlyUsage(item.sku, qty)}
                    </td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {formatCurrency(qty * item.unit_price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Notes section */}
      <div className="card-glass" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>AI Proposal Notes & Comments</span>
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Verify and modify the narrative below. These comments will print on the generated PDF contract statement.
        </p>
        <textarea
          className="form-input"
          style={{
            width: '100%',
            height: '110px',
            fontSize: '0.8125rem',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
          value={proposalNotes}
          onChange={(e) => setProposalNotes(e.target.value)}
        />
      </div>

    </div>
  );
}
