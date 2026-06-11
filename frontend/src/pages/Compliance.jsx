import React from 'react';
import { ShieldCheck, Info, FileText, Download } from 'lucide-react';

export default function Compliance() {
  const manuals = [
    { name: 'OSHA Safety Standards (June 2026 Revision)', desc: 'Safety protocols, SDS sheet compliance labels, hazardous materials storage guidelines.', date: '01/06/2026' },
    { name: 'NABH Hospital Cleaning Protocols Manual', desc: 'Required hygiene setups, biohazard disposal guidelines, hospital-grade disinfectant usage logs.', date: '15/05/2026' },
    { name: 'HACCP Food Safety Guidelines Catalog', desc: 'Chemicals segregation, sanitizing schedules, kitchen and dining hall compliance checkbooks.', date: '10/05/2026' },
    { name: 'ISO 14001 Chemical Green certification checklist', desc: 'Biodegradable cleaning fluids, environmental footprint calculations, green criteria guides.', date: '02/04/2026' }
  ];

  return (
    <div className="animate-fade">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Compliance & MSDS Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Examine regulatory cleaning requirements and material safety guidelines.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Compliance manuals */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
            <span>Safety Guidelines & Directives</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {manuals.map((m, idx) => (
              <div key={idx} style={{
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {m.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {m.desc}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                    Uploaded: {m.date}
                  </span>
                </div>
                
                <button className="btn btn-secondary" style={{ padding: '0.5rem', height: '34px', width: '34px' }} title="Download Guidelines Document">
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card-glass" style={{ backgroundColor: 'var(--info-light)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--info)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} />
              <span>MSDS Safety Note</span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              All chemical products registered in the Warehouse catalog (e.g. TR-005 Toilet Bowl Cleaner, FL-012 Floor Disinfectant) are certified non-corrosive and include full MSDS documentation folders.
            </p>
            <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.2)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--info)', fontWeight: '600' }}>
                Access Global MSDS Directory &rarr;
              </a>
            </div>
          </div>

          <div className="card-glass">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>Audits checklist</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Ensure site visits match these directives:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked readOnly style={{ accentColor: 'var(--success)' }} />
                <span>Verify MSDS sheets are posted in storage aisles</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked readOnly style={{ accentColor: 'var(--success)' }} />
                <span>Color-coded microfiber rags segregation verified</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked readOnly style={{ accentColor: 'var(--success)' }} />
                <span>Chemical dilution guides clearly labeled</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
