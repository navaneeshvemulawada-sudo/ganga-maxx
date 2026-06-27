import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import bgImage from '../assets/login_background.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(username, password);
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
      <div className="login-left-pane" style={{
        flex: '0 0 45%',
        padding: '3rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '4rem',
        backgroundColor: 'var(--bg-secondary)',
        overflowY: 'auto'
      }}>
        {/* Logo header */}
        <div className="login-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        <div className="login-form-container" style={{ margin: '2rem 0', maxWidth: '420px', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            WELCOME BACK
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0 0.75rem 0', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Sign in to CleanBundle
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.4' }}>
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
                  placeholder="email@example.com"
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

            {/* Continue with SSO */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '46px',
                marginTop: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                gap: '0.5rem',
                borderColor: 'var(--border-color)'
              }}
              disabled={loading}
            >
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
              <span>Continue with SSO</span>
            </button>
          </form>
        </div>



      </div>

      {/* Right Pane - Visual showcase */}
      <div className="login-right-pane" style={{
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
