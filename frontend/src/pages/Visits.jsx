import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Visits() {
  const [visits, setVisits] = useState([
    { id: 1, customer: 'St. Mary\'s Hospital', location: 'New Delhi, Sector 4', time: '10:00 AM', date: 'June 12, 2026', inspector: 'John Doe', status: 'Scheduled' },
    { id: 2, customer: 'Skyline Tech Park', location: 'Hyderabad, IT Corridor', time: '02:30 PM', date: 'June 14, 2026', inspector: 'Jane Smith', status: 'Scheduled' },
    { id: 3, customer: 'Sunrise Hotel & Suites', location: 'Mumbai, Marine Drive', time: '11:00 AM', date: 'June 08, 2026', inspector: 'Robert Lee', status: 'Completed' },
    { id: 4, customer: 'Greenwood International', location: 'Bangalore, Sarjapur Road', time: '09:30 AM', date: 'June 05, 2026', inspector: 'Emily Davis', status: 'Completed' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    customer: '',
    location: '',
    time: '09:00 AM',
    date: '',
    inspector: 'John Doe'
  });

  const handleAddVisit = (e) => {
    e.preventDefault();
    if (!newVisit.customer || !newVisit.date) return;
    
    setVisits(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newVisit,
        status: 'Scheduled'
      }
    ]);
    setModalOpen(false);
    setNewVisit({ customer: '', location: '', time: '09:00 AM', date: '', inspector: 'John Doe' });
  };

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
            Site Inspections & Visits
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Schedule and review audits, deliveries, and supply-use checks.
          </p>
        </div>

        <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Log Audit Visit</span>
        </button>
      </div>

      <div className="grid-cols-1">
        <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Inspection Schedule Logs</h3>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client Institution</th>
                  <th>Location</th>
                  <th>Date & Time</th>
                  <th>Assigned Officer</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{v.customer}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{v.location}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{v.date} ({v.time})</span>
                      </div>
                    </td>
                    <td>{v.inspector}</td>
                    <td>
                      <span className={`badge ${v.status === 'Completed' ? 'badge-approved' : 'badge-pending'}`} style={{ gap: '0.25rem' }}>
                        {v.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{v.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Basic creation modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Inspection Audit</h3>
            </div>
            <form onSubmit={handleAddVisit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Client Institution Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newVisit.customer}
                    onChange={e => setNewVisit(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="e.g. Skyline Tech Campus"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery/Inspection Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newVisit.location}
                    onChange={e => setNewVisit(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Sector 4, Building B"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newVisit.date}
                      onChange={e => setNewVisit(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. June 15, 2026"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newVisit.time}
                      onChange={e => setNewVisit(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g. 10:30 AM"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
