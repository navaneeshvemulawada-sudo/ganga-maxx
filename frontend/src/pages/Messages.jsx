import React, { useState } from 'react';
import { Send, Search, Sparkles } from 'lucide-react';

export default function Messages() {
  const [messages, setMessages] = useState([
    { sender: 'procurement', text: 'Hello, when can we expect delivery of the TR-005 Toilet Cleaner batch? We are running low on stock in Block B.', time: '10:02 AM' },
    { sender: 'system', text: 'CleanBundle AI system check: Product TR-005 has been marked as low stock in the Warehouse. Order generated.', time: '10:03 AM' },
    { sender: 'me', text: 'Hello! I have created draft Quotation QT-20260610-0001 for the refills. Once you approve it, we will ship immediately.', time: '11:15 AM' },
    { sender: 'procurement', text: 'Perfect. Let me review the draft quote and submit it for facilities approval now.', time: '11:17 AM' }
  ]);

  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { sender: 'me', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInput('');

    // Trigger dummy AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'procurement', text: 'Got it. Thanks! We will update you shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
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
            Communications Inbox
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Chat with customer procurement agents and review automated logistics notifications.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        height: '62vh',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Left column: Chats listing */}
        <div style={{
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search messages..."
                style={{ paddingLeft: '30px', height: '34px', fontSize: '0.75rem' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {[
              { name: 'St. Mary\'s Hospital', preview: 'Let me review the draft quote...', active: true, time: '11:17 AM' },
              { name: 'Skyline Tech Operations', preview: 'Thanks for the fast delivery audit!', active: false, time: 'Yesterday' },
              { name: 'Sunrise Housekeeping', preview: 'Can we switch to biodegradable...', active: false, time: '2 days ago' }
            ].map((chat, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: chat.active ? 'var(--bg-hover)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{chat.name}</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{chat.time}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {chat.preview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Active Chat viewport */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                St. Mary's Hospital Procurement
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--success)', borderRadius: '50%' }} />
                <span>Procurement Agent Active</span>
              </span>
            </div>
            
            <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', fontSize: '0.7rem', gap: '0.2rem' }}>
              <Sparkles size={10} />
              <span>AI Agent Online</span>
            </span>
          </div>

          {/* Message view area */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-primary)' }}>
            {messages.map((m, index) => {
              const isMe = m.sender === 'me';
              const isSys = m.sender === 'system';
              
              if (isSys) {
                return (
                  <div key={index} style={{
                    alignSelf: 'center',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    maxWidth: '80%',
                    textAlign: 'center',
                    border: '1px dashed var(--accent-primary)'
                  }}>
                    {m.text}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    backgroundColor: isMe ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    maxWidth: '70%',
                    boxShadow: 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  <p>{m.text}</p>
                  <span style={{
                    fontSize: '0.625rem',
                    color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                    display: 'block',
                    textAlign: 'right',
                    marginTop: '0.25rem'
                  }}>
                    {m.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type message to client..."
              style={{ flex: 1, height: '40px' }}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '40px', height: '40px', padding: 0 }}>
              <Send size={16} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
