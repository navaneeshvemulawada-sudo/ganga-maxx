import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ShieldAlert, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import bgImage from '../../assets/login_background.png';
import { supabase } from '../../supabaseClient';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: role,
            username: username
          }
        }
      });

      if (sbError) throw sbError;

      if (data.session) {
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          username: username,
          email: email,
          role: role,
          is_approved: true
        }));
      } else if (data.user) {
        localStorage.setItem('token', 'supabase-pending-confirm');
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          username: username,
          email: email,
          role: role,
          is_approved: true
        }));
      }

      setSuccess('Account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different username/email.');
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
      
      {/* Left Pane - Registration Form */}
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
            START FOR FREE
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0 0.75rem 0', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Create Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            Access customized workflows, inventory usage logs, and AI recommendation assistants today.
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

          {success && (
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
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Username Input */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  placeholder="e.g. test_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  placeholder="e.g. user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Password</label>
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

            {/* Role select */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Requested Role</label>
              <select
                className="form-input"
                style={{ height: '44px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="client">Client (Institutional Customer)</option>
                <option value="operations">Operations (Facility Manager)</option>
                <option value="supervisor">Supervisor (Housekeeping Manager)</option>
                <option value="distributor">Distributor (Dealer)</option>
                <option value="admin">Admin (Company Internal Staff)</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block', lineHeight: '1.3' }}>
                {['client', 'distributor'].includes(role) 
                  ? '✓ Clients and Distributors get free, immediate account activation.' 
                  : '⚠ Staff roles (Operations, Supervisor, Admin) require company verification and admin approval.'}
              </span>
            </div>

            {/* Register action */}
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
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>

            {/* Link to Login */}
            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Already registered? <Link to="/login" style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>Login here</Link>
            </div>
          </form>
        </div>

        {/* Info footer */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          By creating an account, you agree to the CleanBundle Terms of Service.
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
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(6, 182, 212, 0.65) 100%)',
          zIndex: 1
        }} />

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
            MULTI-ROLE WORKSPACES
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
            Fully segregated accounts for clients, managers, and supply chain operators.
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '3.5rem',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            CleanBundle automatically shifts options, pipelines, and dashboards depending on who logs in.
          </p>
        </div>

      </div>

    </div>
  );
}
