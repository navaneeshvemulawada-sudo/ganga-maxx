import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);
  const location = useLocation();

  // Listen for global shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = (path) => {
    if (path === '/' || path === '') return 'Dashboard';
    if (path.startsWith('/customers')) return 'CRM Customers';
    if (path.startsWith('/requirements')) return 'New Requirement';
    if (path.startsWith('/quotations')) return 'Quotations';
    if (path.startsWith('/recommend')) return 'AI Bundle';
    if (path.startsWith('/inventory')) return 'Warehouse';
    if (path.startsWith('/visits')) return 'Visits';
    if (path.startsWith('/compliance')) return 'Compliance';
    if (path.startsWith('/messages')) return 'Messages';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/admin')) return 'Admin';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Breadcrumbs Nav Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-muted)' }}>CleanBundle</span>
        <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{pageTitle}</span>
      </div>

      {/* Centered Pill Search Input */}
      <div style={{ position: 'relative', width: '380px', margin: '0 2rem' }}>
        <Search size={16} style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search customers, products, quotations..."
          style={{
            width: '100%',
            padding: '8px 45px 8px 38px',
            height: '38px',
            fontSize: '0.8125rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          className="search-pill-input"
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
          }}
        />
        <kbd style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '2px 5px',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
          pointerEvents: 'none'
        }}>
          ⌘K
        </kbd>
      </div>

      {/* Right control utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* AI Assistant button */}
        <button
          className="btn"
          style={{
            height: '38px',
            backgroundColor: '#e6fbf4',
            color: '#10b981',
            border: '1px solid #10b981',
            fontSize: '0.8125rem',
            padding: '0 1.25rem',
            borderRadius: '9999px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e6fbf4';
            e.currentTarget.style.color = '#10b981';
          }}
        >
          <Sparkles size={14} />
          <span>AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '50%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Bell size={18} />
          </button>
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#f59e0b',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: '1px solid var(--bg-secondary)'
          }} />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
