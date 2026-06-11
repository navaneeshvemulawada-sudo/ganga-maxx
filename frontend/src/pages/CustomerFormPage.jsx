import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Globe, UserPlus } from 'lucide-react';
import customerService from '../services/customerService';

export default function CustomerFormPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    facility_type: 'Corporate Office',
    company: '',
    email: '',
    phone: '',
    address: '',
    floors: '5',
    staff: '120',
    area: '25000',
    compliance: '',
    tags: '',
    cleaning_frequency: 'Daily',
    num_washrooms: '4',
    daily_visitors: '150',
    preferred_schedule: 'Morning',
    current_supplier: '',
    monthly_budget: '10000'
  });

  const categories = ['All', 'Healthcare', 'Education', 'Corporate Office', 'Hospitality', 'Retail', 'Manufacturing', 'Other'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      // Calculate random health score between 65 and 95
      const health_score = Math.floor(Math.random() * (95 - 65 + 1)) + 65;

      const payload = {
        ...formData,
        company: formData.company || formData.name,
        floors: parseInt(formData.floors) || 1,
        staff: parseInt(formData.staff) || 0,
        area: parseInt(formData.area) || 0,
        num_washrooms: parseInt(formData.num_washrooms) || 0,
        daily_visitors: parseInt(formData.daily_visitors) || 0,
        monthly_budget: parseFloat(formData.monthly_budget) || 0.0,
        health_score
      };

      await customerService.create(payload);
      setModalOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        facility_type: 'Corporate Office',
        company: '',
        email: '',
        phone: '',
        address: '',
        floors: '5',
        staff: '120',
        area: '25000',
        compliance: '',
        tags: '',
        cleaning_frequency: 'Daily',
        num_washrooms: '4',
        daily_visitors: '150',
        preferred_schedule: 'Morning',
        current_supplier: '',
        monthly_budget: '10000'
      });

      fetchCustomers();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const categoryMatch = selectedCategory === 'All' || c.facility_type?.toLowerCase() === selectedCategory.toLowerCase();
    
    const term = search.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(term);
    const emailMatch = c.email?.toLowerCase().includes(term);
    const locationMatch = c.address?.toLowerCase().includes(term);
    const companyMatch = c.company?.toLowerCase().includes(term);
    
    return categoryMatch && (nameMatch || emailMatch || locationMatch || companyMatch);
  });

  const getHealthColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#10b981'; // Green health score matching screenshots (e.g. 75, 71, 92 are green)
    return '#f97316'; // Orange rating (e.g. 64)
  };

  const getHealthBg = (score) => {
    if (score >= 70) return '#e6fbf4';
    return '#fff7ed';
  };

  const getHealthBorder = (score) => {
    if (score >= 70) return '#a7f3d0';
    return '#fed7aa';
  };

  const formatNumberWithCommas = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header and Description */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            CRM
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Customer Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            8 institutional customers across your pipeline
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
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar and Pill Categories row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2.25rem',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '330px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search by institution or contact..."
            className="form-input"
            style={{
              paddingLeft: '36px',
              height: '38px',
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#fff'
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter categories list */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: '0 1rem',
                fontSize: '0.8125rem',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid',
                backgroundColor: selectedCategory === cat ? '#0f172a' : '#f1f5f9',
                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                borderColor: selectedCategory === cat ? '#0f172a' : '#e2e8f0',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading customer list...</span>
        </div>
      ) : (
        <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
          {filteredCustomers.map(cust => (
            <div
              key={cust.id}
              className="card-glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                {/* Score badge at top right */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '0.8125rem',
                    color: getHealthColor(cust.health_score),
                    backgroundColor: getHealthBg(cust.health_score),
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${getHealthBorder(cust.health_score)}`
                  }}>
                    {cust.health_score}
                  </span>
                </div>

                {/* Customer name */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {cust.name}
                </h3>
                
                {/* Subtitle / Classification and Address */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '1.25rem' }}>
                  {cust.facility_type} {cust.address ? `• ${cust.address}` : ''}
                </p>

                {/* Stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem 0.5rem',
                  padding: '1rem 0',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Floors</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>{cust.floors || 1}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Staff</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>{cust.staff || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Area</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {cust.area ? `${formatNumberWithCommas(cust.area)} sqft` : '0 sqft'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Washrooms</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>{cust.num_washrooms || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Visitors</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>{cust.daily_visitors || 0}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block' }}>Budget</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {cust.monthly_budget ? `₹${formatNumberWithCommas(cust.monthly_budget)}` : 'N/A'}
                    </span>
                  </div>
                </div>
                {/* Additional business fields */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {cust.cleaning_frequency && (
                    <div><strong>Frequency:</strong> {cust.cleaning_frequency} ({cust.preferred_schedule || 'Anytime'})</div>
                  )}
                  {cust.current_supplier && (
                    <div><strong>Supplier:</strong> {cust.current_supplier}</div>
                  )}
                </div>
              </div>

              {/* Tags display at card bottom */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', minHeight: '26px' }}>
                {cust.tags ? (
                  cust.tags.split(',').map(tag => {
                    const cleaned = tag.trim();
                    if (!cleaned) return null;
                    return (
                      <span
                        key={cleaned}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: '#f1f5f9',
                          color: 'var(--text-secondary)',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {cleaned}
                      </span>
                    );
                  })
                ) : null}
              </div>

            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No customer institutions match this criteria.
            </div>
          )}
        </div>
      )}

      {/* Creation Modal popup */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                <UserPlus size={20} style={{ color: '#0f172a' }} />
                <span>Create CRM Customer Profile</span>
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* Name */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Institution/Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Test University"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Facility type select */}
                <div className="form-group">
                  <label className="form-label">Facility Classification</label>
                  <select name="facility_type" className="form-input" value={formData.facility_type} onChange={handleInputChange}>
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery location address */}
                <div className="form-group">
                  <label className="form-label">Delivery Location</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="e.g. Building A, Room 101"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Contact Email */}
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="e.g. admin@test.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Contact phone */}
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    placeholder="e.g. +91 99887 76655"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Floors */}
                <div className="form-group">
                  <label className="form-label">Floors count</label>
                  <input
                    type="number"
                    name="floors"
                    className="form-input"
                    value={formData.floors}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Staff */}
                <div className="form-group">
                  <label className="form-label">Active Staff count</label>
                  <input
                    type="number"
                    name="staff"
                    className="form-input"
                    value={formData.staff}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Area */}
                <div className="form-group">
                  <label className="form-label">Estimated Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    className="form-input"
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Compliance tags */}
                <div className="form-group">
                  <label className="form-label">Compliance requirements (comma-separated)</label>
                  <input
                    type="text"
                    name="compliance"
                    className="form-input"
                    placeholder="e.g. LEED, OSHA"
                    value={formData.compliance}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Profile tags */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Profile tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-input"
                    placeholder="e.g. VIP, Enterprise"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Cleaning Frequency */}
                <div className="form-group">
                  <label className="form-label">Cleaning Frequency</label>
                  <select name="cleaning_frequency" className="form-input" value={formData.cleaning_frequency} onChange={handleInputChange}>
                    <option>Daily</option>
                    <option>Twice Daily</option>
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                {/* Washrooms count */}
                <div className="form-group">
                  <label className="form-label">Number of Washrooms</label>
                  <input
                    type="number"
                    name="num_washrooms"
                    className="form-input"
                    value={formData.num_washrooms}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Daily visitors */}
                <div className="form-group">
                  <label className="form-label">Daily Visitors</label>
                  <input
                    type="number"
                    name="daily_visitors"
                    className="form-input"
                    value={formData.daily_visitors}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Preferred Cleaning Schedule */}
                <div className="form-group">
                  <label className="form-label">Preferred Cleaning Schedule</label>
                  <select name="preferred_schedule" className="form-input" value={formData.preferred_schedule} onChange={handleInputChange}>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                </div>

                {/* Current Supplier */}
                <div className="form-group">
                  <label className="form-label">Current Supplier</label>
                  <input
                    type="text"
                    name="current_supplier"
                    className="form-input"
                    placeholder="e.g. ABC Cleaning supplies"
                    value={formData.current_supplier}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Monthly Budget */}
                <div className="form-group">
                  <label className="form-label">Monthly Cleaning Budget (₹)</label>
                  <input
                    type="number"
                    name="monthly_budget"
                    className="form-input"
                    value={formData.monthly_budget}
                    onChange={handleInputChange}
                  />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}>
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
