import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation (mobile view)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (!currentSession) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          // Query public.users table to check approval status
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentSession.user.email)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          // Determine user role (profile role or metadata role)
          const rawRole = profile ? profile.role : (currentSession.user.user_metadata?.role || 'client');
          const roleLower = String(rawRole).toLowerCase().trim();
          const userRole = roleLower === 'supervisior' ? 'supervisor' : rawRole;
          const requiresApproval = ['operations', 'supervisor', 'admin', 'supervisior'].includes(roleLower);

          if (requiresApproval) {
            if (!profile || !profile.is_approved) {
              await supabase.auth.signOut();
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setSession(null);
              navigate('/login', { state: { message: 'Your account is pending admin approval.' } });
              return;
            }
          }

          // Keep local storage items in sync
          localStorage.setItem('token', currentSession.access_token);
          localStorage.setItem('user', JSON.stringify({
            id: profile ? profile.id : currentSession.user.id,
            username: profile ? profile.full_name : currentSession.user.email.split('@')[0],
            email: currentSession.user.email,
            role: userRole,
            is_approved: profile ? profile.is_approved : true
          }));
        }
      } catch (err) {
        console.error('Session check error:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)'
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!session) {
    return null; // Don't render layout if not authorized
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main panel viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%' }}>
        {/* Main top header bar */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Viewport content area */}
        <main className="main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
