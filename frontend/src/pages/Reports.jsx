import React from 'react';
import { BarChart3, LineChart, PieChart, Download, FileSpreadsheet, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Reports() {
  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Analytics & Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Examine business intelligence metrics, consumption ratios, and sales pipelines.
          </p>
        </div>

        <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Download size={16} />
          <span>Export Annual Report</span>
        </button>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Supply Burn Rate</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹4,250</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ day average</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Consumables usage rate has decreased by 4% since implementing bulk packaging recommendation guidelines.
          </p>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Contract Conversion</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>74.8%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversion rate</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Average transition time from AI Bundle suggestion to Approved Quotation contract is 3.4 days.
          </p>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Eco Compliance Ratio</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--info)' }}>82.5%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sustainable items</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Over 80% of chemicals recommended for institutional buyers utilize eco-label certified ingredients.
          </p>
        </div>
      </div>

      {/* Main Layout charts/tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Sales Pipeline breakdown */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>Sales Pipeline Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { stage: '1. Requirement Wizard Configured', value: '45 Profiles', percent: 100, color: 'var(--accent-primary)' },
              { stage: '2. AI Recommendations Built', value: '38 Recommended', percent: 84, color: 'var(--info)' },
              { stage: '3. Draft Quotations Saved', value: '29 Quotations', percent: 64, color: 'var(--warning)' },
              { stage: '4. Approved Contracts Signed', value: '22 Customers', percent: 48, color: 'var(--success)' }
            ].map(stage => (
              <div key={stage.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stage.stage}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{stage.value} ({stage.percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${stage.percent}%`, height: '100%', backgroundColor: stage.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export log history */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Reports Export</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { name: 'May Consumables Audit', date: 'May 31, 2026', type: 'PDF' },
              { name: 'Q1 Logistics & Aisle Inventory', date: 'April 15, 2026', type: 'XLSX' },
              { name: 'St. Mary\'s Hospital Agreement', date: 'June 01, 2026', type: 'PDF' },
              { name: 'OSHA Safety Inspections Log', date: 'June 05, 2026', type: 'CSV' }
            ].map((log, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-hover)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>{log.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.date}</span>
                </div>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', height: '28px', fontSize: '0.7rem' }}>
                  <Download size={10} />
                  <span>{log.type}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
