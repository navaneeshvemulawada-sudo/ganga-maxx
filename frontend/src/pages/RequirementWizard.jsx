import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  ClipboardList,
  ShieldCheck,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import customerService from '../services/customerService';
import api from '../services/api';

export default function RequirementWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Wizard state values
  const [formData, setFormData] = useState({
    // Step 1: Institution Details
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    facility_type: 'Corporate Office',
    
    // Step 2: Facility Details
    floors: '4',
    staff_count: '120',
    area: '25000',
    num_washrooms: '4',
    daily_visitors: '150',
    
    // Step 3: Cleaning Requirements
    cleaning_frequency: 'Daily',
    preferred_schedule: 'Morning',
    current_supplier: '',
    monthly_budget: '10000',
    contract_duration: '12 Months',
    compliance: []
  });

  useEffect(() => {
    customerService.getAll()
      .then(data => setCustomers(data))
      .catch(err => console.error(err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCustomer = (e) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    if (!id) return;
    
    const selected = customers.find(c => c.id === parseInt(id));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        name: selected.name,
        contactName: selected.company || selected.name,
        phone: selected.phone || '',
        email: selected.email || '',
        address: selected.address || '',
        facility_type: selected.facility_type || 'Corporate Office',
        floors: String(selected.floors || 4),
        staff_count: String(selected.staff || 120),
        area: String(selected.area || 25000),
        compliance: selected.compliance ? selected.compliance.split(',').map(x => x.trim()) : [],
        cleaning_frequency: selected.cleaning_frequency || 'Daily',
        num_washrooms: String(selected.num_washrooms || 4),
        daily_visitors: String(selected.daily_visitors || 150),
        preferred_schedule: selected.preferred_schedule || 'Morning',
        current_supplier: selected.current_supplier || '',
        monthly_budget: String(selected.monthly_budget || 10000)
      }));
    }
  };

  const handleFrequencySelect = (freq) => {
    setFormData(prev => ({ ...prev, cleaning_frequency: freq }));
  };

  const toggleCompliance = (item) => {
    setFormData(prev => {
      const current = [...prev.compliance];
      const index = current.indexOf(item);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(item);
      }
      return { ...prev, compliance: current };
    });
  };

  const nextStep = () => {
    if (step === 1 && !formData.name) {
      alert('Please enter or select an Institution name.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleGenerateBundle = async () => {
    try {
      const payload = {
        facility_type: formData.facility_type,
        floors: parseInt(formData.floors) || 1,
        staff_count: parseInt(formData.staff_count) || 0,
        area: parseInt(formData.area) || 0,
        cleaning_frequency: formData.cleaning_frequency,
        compliance: formData.compliance,
        num_washrooms: parseInt(formData.num_washrooms) || 0,
        daily_visitors: parseInt(formData.daily_visitors) || 0,
        preferred_schedule: formData.preferred_schedule,
        current_supplier: formData.current_supplier,
        monthly_budget: parseFloat(formData.monthly_budget) || 0
      };

      const recommendation = await api.apiCall('/api/recommend', {
        method: 'POST',
        body: payload
      });

      sessionStorage.setItem('wizard_inputs', JSON.stringify({
        ...formData,
        customerId: selectedCustomerId
      }));
      sessionStorage.setItem('ai_recommendation', JSON.stringify(recommendation));

      navigate('/recommend');
    } catch (err) {
      alert('AI Recommendation generation failed: ' + err.message);
    }
  };

  // Tips for the right-side AI Sidebar box
  const getSidebarTips = () => {
    switch (step) {
      case 1:
        return [
          { bold: "Healthcare facilities", text: " require hospital-grade disinfectants and OSHA-compliant PPE." },
          { bold: "Daily cleaning frequency", text: " typically consumes ~12L disinfectant per 5000 sqft per month." },
          { bold: "Sustainability options", text: " reduce TCO by ~8% over a 12-month contract." }
        ];
      case 2:
        return [
          { bold: "Total built-up area", text: " governs overall chemical dilution and dispenser count requirements." },
          { bold: "Floor configuration", text: " directly influences labor division and distributed inventory storage limits." },
          { bold: "Daily occupant staff", text: " drives consumable soap and hygiene hand-rub station volumes." },
          { bold: "Number of washrooms", text: " directly scales disinfectant and tissue paper consumption forecasts." }
        ];
      case 3:
        return [
          { bold: "Cleaning schedules", text: " should match facility occupancy patterns to minimize business disruption." },
          { bold: "Workplace compliance", text: " requires specialized color-coded tools and SDS data sheets." },
          { bold: "A 12-month contract lock", text: " secures discount rates on raw consumable costs and guarantees deliveries." }
        ];
      case 4:
        return [
          { bold: "Confirm specifications", text: " before sending the draft to our AI recommend engine." },
          { bold: "The generated bundle workspace", text: " will allow manual additions of items and cost editing later." },
          { bold: "Customer details", text: " will automatically sync to your CRM profile database." }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '2rem' }}>
      
      {/* Wizard Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          NEW QUOTATION
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Customer Requirements
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Tell us about the facility and we'll generate an AI-optimized bundle.
        </p>
      </div>

      {/* Stepper horizontal card banner matching exactly 4 steps */}
      <div className="card-glass" style={{
        padding: '0.875rem 1.5rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {[
          { label: 'Institution Details', num: 1 },
          { label: 'Facility Details', num: 2 },
          { label: 'Cleaning Requirements', num: 3 },
          { label: 'Generate Bundle', num: 4 }
        ].map((s, idx) => {
          const isActive = step === s.num;
          
          return (
            <React.Fragment key={s.num}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#0f172a' : '#f1f5f9',
                  color: isActive ? '#fff' : '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.8125rem'
                }}>
                  {s.num}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '1.25rem' }}>&gt;</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Two-Column Form and AI Tips Split Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Form parameters card */}
        <div className="card-glass" style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          
          {/* STEP 1: Institution Details */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Institution Details
              </h2>

              {/* Quick Select autofill dropdown */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <label className="form-label" style={{ color: '#0369a1', fontWeight: '700', fontSize: '0.8125rem' }}>
                  Autofill from CRM Customers database
                </label>
                <select className="form-input" style={{ height: '38px', borderRadius: '6px', marginTop: '0.25rem' }} value={selectedCustomerId} onChange={handleSelectCustomer}>
                  <option value="">-- Create a new institution profile --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.facility_type})</option>
                  ))}
                </select>
              </div>

              {/* Input fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Institution Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Test University"
                    style={{ height: '38px', borderRadius: '6px' }}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Name / Company</label>
                  <input
                    type="text"
                    name="contactName"
                    className="form-input"
                    placeholder="e.g. Procurement Lead"
                    style={{ height: '38px', borderRadius: '6px' }}
                    value={formData.contactName}
                    onChange={handleInputChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      placeholder="e.g. +91 99887 76655"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="e.g. admin@test.edu"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Delivery Location</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="e.g. Building A, Room 101"
                    style={{ height: '38px', borderRadius: '6px' }}
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Institution / Facility Type</label>
                  <select name="facility_type" className="form-input" style={{ height: '38px', borderRadius: '6px' }} value={formData.facility_type} onChange={handleInputChange}>
                    <option>Corporate Office</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Hospitality</option>
                    <option>Retail</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Facility Details */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Facility Details Specifications
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Floors count</label>
                    <input
                      type="number"
                      name="floors"
                      className="form-input"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.floors}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total Built-up Area (sqft)</label>
                    <input
                      type="number"
                      name="area"
                      className="form-input"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.area}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Active Staff count</label>
                  <input
                    type="number"
                    name="staff_count"
                    className="form-input"
                    style={{ height: '38px', borderRadius: '6px' }}
                    value={formData.staff_count}
                    onChange={handleInputChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Number of Washrooms</label>
                    <input
                      type="number"
                      name="num_washrooms"
                      className="form-input"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.num_washrooms}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Number of Daily Visitors</label>
                    <input
                      type="number"
                      name="daily_visitors"
                      className="form-input"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.daily_visitors}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Cleaning Requirements & Compliances */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Cleaning Requirements & Compliance
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cleaning Cycle Frequency</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {['Daily', 'Twice Daily', 'Weekly', 'Bi-weekly', 'Monthly'].map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => handleFrequencySelect(freq)}
                        className="btn"
                        style={{
                          padding: '0 0.75rem',
                          height: '34px',
                          borderRadius: '6px',
                          border: '1px solid',
                          backgroundColor: formData.cleaning_frequency === freq ? '#0f172a' : '#f1f5f9',
                          color: formData.cleaning_frequency === freq ? '#fff' : 'var(--text-secondary)',
                          borderColor: formData.cleaning_frequency === freq ? '#0f172a' : '#e2e8f0',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          flex: 1,
                          cursor: 'pointer'
                        }}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Preferred Cleaning Schedule</label>
                    <select name="preferred_schedule" className="form-input" style={{ height: '38px', borderRadius: '6px' }} value={formData.preferred_schedule} onChange={handleInputChange}>
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Target Contract Duration</label>
                    <select name="contract_duration" className="form-input" style={{ height: '38px', borderRadius: '6px' }} value={formData.contract_duration} onChange={handleInputChange}>
                      <option>3 Months</option>
                      <option>6 Months</option>
                      <option>12 Months</option>
                      <option>24 Months</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Current Supplier</label>
                    <input
                      type="text"
                      name="current_supplier"
                      className="form-input"
                      placeholder="e.g. Local vendor"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.current_supplier}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Monthly Cleaning Budget (₹)</label>
                    <input
                      type="number"
                      name="monthly_budget"
                      className="form-input"
                      style={{ height: '38px', borderRadius: '6px' }}
                      value={formData.monthly_budget}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Compliance checkboxes inline */}
                <div className="form-group" style={{ margin: '0.5rem 0 0 0' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Compliance Certifications</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { id: 'NABH', title: 'NABH Healthcare' },
                      { id: 'HACCP', title: 'HACCP Safety' },
                      { id: 'ISO 14001', title: 'ISO 14001 Green' },
                      { id: 'LEED', title: 'LEED Sustainable' },
                      { id: 'FSSAI', title: 'FSSAI Food Disinfect' },
                      { id: 'OSHA', title: 'OSHA Safety' }
                    ].map(comp => {
                      const isChecked = formData.compliance.includes(comp.id);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => toggleCompliance(comp.id)}
                          className="btn"
                          style={{
                            height: '38px',
                            padding: '0 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: isChecked ? '#e0f2fe' : '#fff',
                            color: 'var(--text-primary)',
                            border: '1px solid',
                            borderColor: isChecked ? '#0ea5e9' : 'var(--border-color)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span>{comp.title}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            style={{ accentColor: '#0ea5e9', cursor: 'pointer' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Generate Bundle */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Review Configuration
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                    Institution Details
                  </h4>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Company/Contact:</strong> {formData.contactName || 'N/A'}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Type:</strong> {formData.facility_type}
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    <strong>Location:</strong> {formData.address || 'N/A'}
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                    Facility Specifications
                  </h4>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Structure:</strong> {formData.floors} Floors
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Built area:</strong> {parseInt(formData.area).toLocaleString()} sqft
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Active Staff:</strong> {formData.staff_count} personnel
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Washrooms:</strong> {formData.num_washrooms}
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    <strong>Daily Visitors:</strong> {formData.daily_visitors}
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                    Cleaning & Budget Parameters
                  </h4>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Frequency:</strong> {formData.cleaning_frequency}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Schedule:</strong> {formData.preferred_schedule}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Supplier:</strong> {formData.current_supplier || 'None'}
                  </p>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <strong>Budget:</strong> ₹{parseFloat(formData.monthly_budget).toLocaleString()} / month
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    <strong>Contract term:</strong> {formData.contract_duration}
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                    Compliance & Tags
                  </h4>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {formData.compliance.length > 0 ? (
                      formData.compliance.map(c => (
                        <span key={c} style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {c}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                height: '38px',
                borderRadius: '8px',
                padding: '0 1.25rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: step === 1 ? 'not-allowed' : 'pointer'
              }}
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="btn"
                style={{
                  height: '38px',
                  borderRadius: '8px',
                  padding: '0 1.25rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#64748b',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={nextStep}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                style={{
                  height: '38px',
                  borderRadius: '8px',
                  padding: '0 1.25rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)'
                }}
                onClick={handleGenerateBundle}
              >
                <Sparkles size={16} />
                <span>Generate AI Recommendation Bundle</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: AI Sidebar tips box */}
        <div style={{
          backgroundColor: '#e6fbf4',
          border: '1px solid #10b981',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
            width: 'fit-content',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            marginBottom: '1rem'
          }}>
            <Sparkles size={12} />
            <span>AI Sidebar</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
            Tips for this step
          </h3>

          <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, margin: '0 0 1.5rem 0' }}>
            {getSidebarTips().map((tip, index) => (
              <li key={index} style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.45',
                position: 'relative',
                paddingLeft: '1rem'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '6px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
                <strong>{tip.bold}</strong>{tip.text}
              </li>
            ))}
          </ul>

          {/* Draft persistent tag at card bottom */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #cbf3e4',
            borderRadius: '6px',
            padding: '0.625rem 0.875rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-muted)'
          }}>
            Auto-saved. Draft persists across refreshes.
          </div>
        </div>

      </div>

    </div>
  );
}
