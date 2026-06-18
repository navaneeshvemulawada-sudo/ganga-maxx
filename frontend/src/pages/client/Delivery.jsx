import React from 'react';
import { Truck, Package, Clock, CheckCircle2 } from 'lucide-react';

export default function ClientDelivery() {
  const activeDeliveries = [
    {
      id: 'TRK-900827361',
      quote: 'QTN-2026-1002',
      destination: 'Test Educational Trust Main Campus',
      carrier: 'CleanBundle Express Logistics',
      status: 'In Transit',
      estArrival: 'June 17, 2026',
      milestones: [
        { title: 'Out for Delivery / Transit', desc: 'Departed Bengaluru Warehouse Hub', date: 'June 15, 2026', active: true },
        { title: 'Processed', desc: 'AI Quotation approved & contract locked', date: 'June 12, 2026', active: false },
        { title: 'Ordered', desc: 'Seeded items packed & SKU tag checked', date: 'June 10, 2026', active: false },
      ]
    }
  ];

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Real-time logistics
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          Delivery & Shipment Tracking
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Monitor active supply chain deliveries, courier dispatches, and arrival timelines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Active Shipments list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="card-glass" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TRACKING ID</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-primary)' }}>{delivery.id}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>EST. ARRIVAL</span>
                  <strong style={{ color: 'var(--info)', fontSize: '0.875rem' }}>{delivery.estArrival}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Associated Contract Quotation:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{delivery.quote}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Destination Address:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{delivery.destination}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Logistics Partner:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{delivery.carrier}</strong>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--info-light)', border: '1px solid rgba(14, 165, 233, 0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: <strong>In Transit</strong> (Freight moving via national highway network)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Timeline steps */}
        {activeDeliveries.map((delivery) => (
          <div key={`${delivery.id}-timeline`} className="card-glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem' }}>Logistics Milestones</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {delivery.milestones.map((m, idx) => (
                <div key={m.title} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* Icon Indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: m.active ? 'var(--info)' : 'var(--bg-hover)',
                      color: m.active ? '#fff' : 'var(--text-muted)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      border: '2px solid var(--border-color)'
                    }}>
                      {m.active ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                    {idx < delivery.milestones.length - 1 && (
                      <div style={{
                        width: '2px',
                        backgroundColor: 'var(--border-color)',
                        flex: 1,
                        minHeight: '2rem',
                        zIndex: 1,
                        marginTop: '0.25rem'
                      }} />
                    )}
                  </div>

                  {/* Milestone Details */}
                  <div style={{ paddingTop: '2px' }}>
                    <strong style={{ fontSize: '0.875rem', color: m.active ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'block' }}>{m.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>{m.desc}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>{m.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
