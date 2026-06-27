import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiCall } from '../services/api';
import authService from '../services/authService';

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications periodically
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        let newNotifications = [];

        // 1. Fetch pending quotations (accessible by client, admin, operations)
        try {
          const quotes = await apiCall('/api/quotations');
          if (Array.isArray(quotes)) {
            let pendingQuotes = [];
            if (user.role === 'admin') {
              pendingQuotes = quotes.filter(q => q.status.toLowerCase() === 'pending approval' || q.status.toLowerCase() === 'generated');
            } else if (user.role === 'operations') {
              pendingQuotes = quotes.filter(q => q.status.toLowerCase() === 'pending approval');
            } else if (user.role === 'client') {
              pendingQuotes = quotes.filter(q => q.user_id === user.id && q.status.toLowerCase() === 'approved');
            }

            pendingQuotes.forEach(q => {
              const dateStr = q.created_at || q.updated_at || new Date().toISOString();
              if (user.role === 'client') {
                newNotifications.push({
                  id: `quote-${q.id}-${q.status}`,
                  title: 'Quotation Approved! 🎉',
                  description: `Your quotation ${q.quotation_number} has been approved.`,
                  path: `/client/quotations`,
                  time: new Date(dateStr)
                });
              } else {
                newNotifications.push({
                  id: `quote-${q.id}-${q.status}`,
                  title: 'Quotation Awaiting Review',
                  description: `Quotation ${q.quotation_number || q.quote_id} for ${q.customer_name} requires approval.`,
                  path: user.role === 'operations' ? '/operations/approvals' : `/quotations/${q.id}`,
                  time: new Date(dateStr)
                });
              }
            });
          }
        } catch (err) {
          console.warn('Failed to fetch quotations for notifications:', err);
        }

        // 2. Fetch pending requisitions (accessible by admin, operations, supervisor)
        if (['admin', 'operations', 'supervisor'].includes(user.role)) {
          try {
            const reqs = await apiCall('/api/requisitions');
            if (Array.isArray(reqs)) {
              let pendingReqs = reqs.filter(r => r.status.toLowerCase() === 'pending');
              if (user.role === 'supervisor') {
                pendingReqs = pendingReqs.filter(r => r.supervisor === user.username);
              }
              
              pendingReqs.forEach(r => {
                newNotifications.push({
                  id: `req-${r.id}`,
                  title: 'Requisition Awaiting Sign-off',
                  description: `Supervisor ${r.supervisor} requested ${r.qty} of ${r.product_name}.`,
                  path: user.role === 'supervisor' ? '/supervisor/inventory' : '/operations/approvals',
                  time: new Date()
                });
              });
            }
          } catch (err) {
            console.warn('Failed to fetch requisitions for notifications:', err);
          }
        }

        // Sort notifications by time descending
        newNotifications.sort((a, b) => b.time - a.time);

        // Keep local storage read/unread states
        const readIds = JSON.parse(localStorage.getItem('read-notifications') || '[]');
        
        const updatedNotifications = newNotifications.map(n => ({
          ...n,
          isRead: readIds.includes(n.id)
        }));

        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Failed to update notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    const readIds = notifications.map(n => n.id);
    localStorage.setItem('read-notifications', JSON.stringify(readIds));
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (n) => {
    const readIds = JSON.parse(localStorage.getItem('read-notifications') || '[]');
    if (!readIds.includes(n.id)) {
      readIds.push(n.id);
      localStorage.setItem('read-notifications', JSON.stringify(readIds));
    }
    
    setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setShowDropdown(false);
    navigate(n.path);
  };

  const formatTime = (date) => {
    try {
      const diffMs = new Date() - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };



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
    <header className="header-container" style={{
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          className="header-menu-btn" 
          onClick={onMenuClick}
          style={{
            display: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.25rem'
          }}
        >
          <Menu size={22} />
        </button>
        <div className="header-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>CleanBundle</span>
          <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
        </div>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{pageTitle}</span>
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
          <span className="header-btn-text">AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
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
              borderRadius: '50%',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: '700',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '340px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)'
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Items List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No notifications at the moment.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--bg-primary)',
                        transition: 'background-color 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'var(--bg-primary)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: n.isRead ? '600' : '700', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                        {n.description}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {formatTime(n.time)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
