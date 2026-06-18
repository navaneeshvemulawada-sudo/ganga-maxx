import React, { useState } from 'react';
import { Settings, Shield, UserPlus, Database, Sparkles, Check, Server, Users } from 'lucide-react';
import authService from '../../services/authService';

export default function AdminDashboard() {
  const currentUser = authService.getCurrentUser() || { username: 'Admin', role: 'admin' };
  
  // Settings state
  const [settings, setSettings] = useState({
    gstRate: '18',
    profitMargin: '25',
    safetyStock: '10',
    allowDiscounts: true,
    enableAILogging: true
  });

  const [savingSettings, setSavingSettings] = useState(false);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  return (
    <div className="animate-fade" style={{ paddingBottom: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          SYSTEM ADMINISTRATION
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Configure AI pricing variables, monitor local database health, and review operational telemetry logs.
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
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
      </div>
    </div>
  );
}
