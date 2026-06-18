import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  FileText,
  Warehouse,
  MapPin,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  LogOut,
  Sparkles,
  Settings,
  Truck,
  ShoppingCart,
  Archive
} from 'lucide-react';
import authService from '../services/authService';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { username: 'Demo Admin', role: 'admin' };

  const getMenuItems = (role) => {
    const r = role ? role.toLowerCase() : 'client';
    switch (r) {
      case 'client':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
          { name: 'New Quotation', path: '/requirements/new', icon: FilePlus },
          { name: 'My Quotations', path: '/client/quotations', icon: FileText },
          { name: 'Delivery Tracking', path: '/client/delivery', icon: Truck },
        ];
      case 'operations':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
          { name: 'New Requirement', path: '/requirements/new', icon: FilePlus },
          { name: 'AI Recommendations', path: '/recommend', icon: Sparkles },
          { name: 'Quotation Approvals', path: '/operations/approvals', icon: ShieldCheck },
          { name: 'Reports', path: '/reports', icon: BarChart3 },
        ];
      case 'supervisor':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
          { name: 'Cleaning Supplies', path: '/supervisor/inventory', icon: Warehouse },
          { name: 'Warehouse Inventory', path: '/inventory', icon: Archive },
        ];
      case 'distributor':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
          { name: 'Bulk Orders', path: '/distributor/bulk-orders', icon: ShoppingCart },
          { name: 'Quotations', path: '/quotations', icon: FileText },
        ];
      case 'admin':
      default:
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
          { name: 'Users List', path: '/admin/users', icon: Users },
          { name: 'Products Pricing', path: '/admin/products', icon: Settings },
          { name: 'Warehouse Inventory', path: '/inventory', icon: Warehouse },
          { name: 'All Quotations', path: '/quotations', icon: FileText },
          { name: 'System Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'AI Config Settings', path: '/admin', icon: Settings, end: true },
        ];
    }
  };

  const menuItems = getMenuItems(user.role);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand logo section */}
      <div style={{
        padding: '1.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--sidebar-border)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.2px',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center'
          }}>
            CleanBundle
          </h2>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block' }}>
            AI QUOTATION SUITE
          </span>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav style={{
        flex: 1,
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                textDecoration: 'none'
              })}
              className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User info footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#00a884',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '1rem',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            {user.username.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '700' }}>
               {user.username === 'partner' || user.username === 'admin' ? 'Demo Partner' : user.username}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: '500' }}>
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-light)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
