import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import bgImage from '../../assets/login_background.png';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState(location.state?.email || 'demo@cleanbundle.ai');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Redirect if authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // Handle state passed from redirect (e.g. from registration)
  useEffect(() => {
    if (location.state?.email) {
      setUsername(location.state.email);
    }
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clean up the history state so the message doesn't persist on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });

      if (sbError) throw sbError;

      if (data.session) {
        // Query public.users table to check approval status
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.user.email)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Determine user role (profile role or metadata role)
        const rawRole = profile ? profile.role : (data.user.user_metadata?.role || 'client');
        const roleLower = String(rawRole).toLowerCase().trim();
        const userRole = roleLower === 'supervisior' ? 'supervisor' : rawRole;
        const requiresApproval = ['operations', 'supervisor', 'admin', 'supervisior'].includes(roleLower);

        if (requiresApproval) {
          if (!profile || !profile.is_approved) {
            await supabase.auth.signOut();
            setError('Your account is pending administrator approval.');
            setLoading(false);
            return;
          }
        }

        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: profile ? profile.id : data.user.id,
          username: profile ? profile.full_name : data.user.email.split('@')[0],
          email: data.user.email,
          role: userRole,
          is_approved: profile ? profile.is_approved : true
        }));
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden'
    }}>
      
      {/* Left Pane - Authentication Form */}
      <div style={{
        flex: '0 0 45%',
        padding: '3rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)',
        overflowY: 'auto'
      }}>
        {/* Logo header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', letterSpacing: '0.5px' }}>
              CleanBundle
            </strong>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginTop: '-2px' }}>
              AI QUOTATION SUITE
            </span>
          </div>
        </div>

        {/* Form content */}
        <div style={{ margin: '2rem 0', maxWidth: '420px', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            WELCOME BACK
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0 0.75rem 0', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Sign in to CleanBundle
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            Generate AI-powered cleaning product quotations, manage CRM, and track warehouse inventory in one place.
          </p>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              fontSize: '0.8125rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username/Email Input */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  placeholder="demo@cleanbundle.ai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.8125rem', fontWeight: '600' }}>Password</label>
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sign in action */}
            <button
              type="submit"
              className="btn"
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#1e3a8a',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.875rem',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.1)'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in &rarr;</span>
              )}
            </button>

            {/* Link to Register */}
            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>Register here</Link>
            </div>
          </form>
        </div>

        {/* Demo info credentials */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', lineHeights: '1.4' }}>
          <div style={{ fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Demo Accounts (Password: Demo@1234):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
            <span>Admin: <strong style={{ color: 'var(--text-secondary)' }}>demo@cleanbundle.ai</strong></span>
            <span>Client: <strong style={{ color: 'var(--text-secondary)' }}>client@cleanbundle.ai</strong></span>
            <span>Operations: <strong style={{ color: 'var(--text-secondary)' }}>operations@cleanbundle.ai</strong></span>
            <span>Supervisor: <strong style={{ color: 'var(--text-secondary)' }}>supervisor@cleanbundle.ai</strong></span>
            <span>Distributor: <strong style={{ color: 'var(--text-secondary)' }}>distributor@cleanbundle.ai</strong></span>
          </div>
        </div>

      </div>

      {/* Right Pane - Visual showcase */}
      <div style={{
        flex: '1',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '5rem 4rem'
      }}>
        {/* Dark overlay with gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(6, 182, 212, 0.65) 100%)',
          zIndex: 1
        }} />

        {/* Content widget */}
        <div style={{ position: 'relative', zIndex: 2, color: '#fff', maxWidth: '640px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--info)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            display: 'block',
            marginBottom: '0.75rem'
          }}>
            AI QUOTATION WORKFLOW
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            lineHeight: '1.15',
            color: '#fff',
            marginBottom: '1rem',
            letterSpacing: '-0.75px',
            fontFamily: 'var(--font-heading)'
          }}>
            From customer brief to PDF quotation in under 60 seconds.
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '3.5rem',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            Built for institutional cleaning suppliers, facility managers, dealers, and compliance teams. Powered by Claude Sonnet 4.5.
          </p>

          {/* Stats metrics row */}
          <div style={{ display: 'flex', gap: '3.5rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>
                12+
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '0.25rem' }}>
                SKUs REGISTERED
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>
                98%
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '0.25rem' }}>
                AI CONFIDENCE
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>
                60s
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '0.25rem' }}>
                AVG QUOTE TIME
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
