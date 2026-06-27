import React, { useState, useEffect } from 'react';
import { Settings, Shield, UserPlus, Database, Sparkles, Check, Server, Users } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';

export default function Admin() {
  const currentUser = authService.getCurrentUser() || { username: 'Partner', role: 'partner' };
  
  // Settings state
  const [settings, setSettings] = useState({
    gstRate: '18',
    profitMargin: '25',
    safetyStock: '10',
    allowDiscounts: true,
    enableAILogging: true
  });

  // User form state
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    role: 'customer',
    password: ''
  });

  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Default seeded users for display
  const [usersList, setUsersList] = useState([]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      alert('System settings updated successfully!');
    }, 800);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegisterSuccess('');
    setRegisterError('');

    if (!userForm.full_name || !userForm.email || !userForm.password) {
      setRegisterError('All fields are required.');
      return;
    }

    try {
      const response = await api.apiCall('/api/auth/register', {
        method: 'POST',
        body: userForm
      });
      
      setRegisterSuccess('New user account registered successfully!');
      
      // Add newly registered user to list
      const newUser = response.user || { 
        id: usersList.length + 1, 
        username: userForm.full_name, 
        email: userForm.email, 
        role: userForm.role 
      };
      
      setUsersList(prev => [...prev, newUser]);
      
      // Clear form
      setUserForm({
        full_name: '',
        email: '',
        role: 'customer',
        password: ''
      });
    } catch (err) {
      setRegisterError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '2.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          SYSTEM ADMINISTRATION
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Admin Settings & Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Configure AI multipliers, manage active personnel logins, and monitor database health.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column - System Config & Users list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Settings Card */}
          <div className="card-glass" style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>AI Engine & Pricing Configuration</span>
            </h3>

            <form onSubmit={handleSaveSettings}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Default GST Rate (%)</label>
                  <input
                    type="number"
                    name="gstRate"
                    className="form-input"
                    value={settings.gstRate}
                    onChange={handleSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Profit Margin Multiplier (%)</label>
                  <input
                    type="number"
                    name="profitMargin"
                    className="form-input"
                    value={settings.profitMargin}
                    onChange={handleSettingsChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Safety Stock Refill Threshold (%)</label>
                  <input
                    type="number"
                    name="safetyStock"
                    className="form-input"
                    value={settings.safetyStock}
                    onChange={handleSettingsChange}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="allowDiscounts"
                    checked={settings.allowDiscounts}
                    onChange={handleSettingsChange}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Allow custom manual discounts on quotation worksheets</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="enableAILogging"
                    checked={settings.enableAILogging}
                    onChange={handleSettingsChange}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Enable telemetry & recommendation audit logging</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '38px', borderRadius: '6px', fontSize: '0.8125rem', gap: '0.35rem' }} disabled={savingSettings}>
                <Check size={14} />
                <span>{savingSettings ? 'Saving Settings...' : 'Save Configuration'}</span>
              </button>
            </form>
          </div>

          {/* Users List Card */}
          <div className="card-glass" style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Users size={20} style={{ color: 'var(--success)' }} />
              <span>Registered Staff Accounts</span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              These personnel are authorized to log into the CleanBundle Executive Suite.
            </p>

            <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>Username</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>Email Address</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>Access Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.8125rem' }}>{u.username}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge" style={{
                          backgroundColor: u.role === 'partner' ? '#fee2e2' : u.role === 'manager' ? '#e0f2fe' : u.role === 'supervisor' ? '#dcfce7' : '#f1f5f9',
                          color: u.role === 'partner' ? '#ef4444' : u.role === 'manager' ? '#0284c7' : u.role === 'supervisor' ? '#15803d' : 'var(--text-secondary)',
                          fontSize: '0.6875rem',
                          fontWeight: '700'
                        }}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column - User Registration & System logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Register User Card */}
          <div className="card-glass" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Create Staff Account</span>
            </h3>

            {registerSuccess && (
              <div style={{ backgroundColor: 'var(--success-light)', borderLeft: '4px solid var(--success)', color: 'var(--success)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                {registerSuccess}
              </div>
            )}
            {registerError && (
              <div style={{ backgroundColor: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  style={{ height: '36px', fontSize: '0.8125rem' }}
                  value={userForm.full_name}
                  onChange={handleUserInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="email@example.com"
                  style={{ height: '36px', fontSize: '0.8125rem' }}
                  value={userForm.email}
                  onChange={handleUserInputChange}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-input"
                  style={{ height: '36px', fontSize: '0.8125rem' }}
                  value={userForm.role}
                  onChange={handleUserInputChange}
                >
                  <option value="customer">Customer</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="partner">Partner (Full Control)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  style={{ height: '36px', fontSize: '0.8125rem' }}
                  value={userForm.password}
                  onChange={handleUserInputChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '38px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                Register Account
              </button>
            </form>
          </div>

          {/* Database Health Card */}
          <div className="card-glass" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <Database size={18} style={{ color: 'var(--info)' }} />
              <span>System Health & Logging</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Server Status:</span>
                <span style={{ color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Server size={12} /> Online
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Active User:</span>
                <span style={{ fontWeight: '600' }}>{currentUser.username} ({currentUser.role})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Database Type:</span>
                <span style={{ fontWeight: '600' }}>pg (postgresql)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Database Location:</span>
                <code style={{ fontSize: '0.7rem', wordBreak: 'break-all', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  tdxkhkrcmnkspxmutzpb.supabase.co
                </code>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
