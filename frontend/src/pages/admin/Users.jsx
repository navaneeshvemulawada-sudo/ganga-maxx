import React, { useState, useEffect } from 'react';
import { UserPlus, Users, ShieldAlert, Check, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'operations',
    password: ''
  });

  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const data = await api.apiCall('/api/auth/users');
      // Sort users by ID ascending
      setUsersList(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setFetchError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegisterSuccess('');
    setRegisterError('');

    if (!userForm.username || !userForm.email || !userForm.password) {
      setRegisterError('All fields are required.');
      return;
    }

    try {
      setRegistering(true);
      await api.apiCall('/api/auth/register', {
        method: 'POST',
        body: userForm
      });
      
      const needsApproval = ['operations', 'supervisor', 'distributor'].includes(userForm.role);
      
      if (needsApproval) {
        setRegisterSuccess(`Account for ${userForm.username} created successfully! Marked as Pending Admin Approval.`);
      } else {
        setRegisterSuccess(`Account for ${userForm.username} created and auto-approved successfully!`);
      }
      
      setUserForm({ username: '', email: '', role: 'operations', password: '' });
      fetchUsers();
    } catch (err) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.apiCall(`/api/auth/users/${userId}/approve`, {
        method: 'PUT'
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to approve user: ' + err.message);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch((role || '').toLowerCase()) {
      case 'admin': return { bg: '#fee2e2', text: '#ef4444' };
      case 'operations': return { bg: '#e0f2fe', text: '#0284c7' };
      case 'supervisor': return { bg: '#dcfce7', text: '#15803d' };
      case 'distributor': return { bg: '#fef3c7', text: '#d97706' };
      default: return { bg: '#f1f5f9', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          USER MANAGEMENT
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.1rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
          System Users List & Approvals
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Monitor active user accounts, approve staff registrations, and create new credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Users List Table */}
        <div className="card-glass" style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Users size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Registered Accounts</span>
          </h3>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
              <span>Loading registered user list...</span>
            </div>
          ) : fetchError ? (
            <div style={{ padding: '2rem', color: 'var(--danger)', textAlign: 'center' }}>
              <ShieldAlert size={32} style={{ marginBottom: '0.5rem' }} />
              <p>{fetchError}</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Access Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const style = getRoleBadgeStyle(u.role);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                        <td style={{ fontWeight: '600', fontSize: '0.8125rem' }}>{u.username}</td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: style.bg, color: style.text, fontSize: '0.6875rem', fontWeight: '700', textTransform: 'capitalize' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.is_approved ? (
                            <span className="badge" style={{ backgroundColor: '#e6fbf4', color: '#10b981', fontSize: '0.6875rem', fontWeight: '700' }}>
                              Active
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#fff7ed', color: '#f97316', fontSize: '0.6875rem', fontWeight: '700' }}>
                              Pending Approval
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {!u.is_approved && (
                            <button
                              onClick={() => handleApproveUser(u.id)}
                              className="btn btn-success"
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.7rem',
                                height: '26px',
                                gap: '2px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Register form */}
        <div className="card-glass" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Create Staff Account</span>
          </h3>

          {registerSuccess && (
            <div style={{ backgroundColor: 'var(--success-light)', borderLeft: '4px solid var(--success)', color: 'var(--success)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1.25rem', fontWeight: '500' }}>
              {registerSuccess}
            </div>
          )}
          {registerError && (
            <div style={{ backgroundColor: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1.25rem', fontWeight: '500' }}>
              {registerError}
            </div>
          )}

          <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g. operational_lead"
                style={{ height: '36px', fontSize: '0.8125rem' }}
                value={userForm.username}
                onChange={handleUserInputChange}
                disabled={registering}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="e.g. user@cleanbundle.ai"
                style={{ height: '36px', fontSize: '0.8125rem' }}
                value={userForm.email}
                onChange={handleUserInputChange}
                disabled={registering}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-input"
                style={{ height: '36px', fontSize: '0.8125rem' }}
                value={userForm.role}
                onChange={handleUserInputChange}
                disabled={registering}
              >
                <option value="operations">Operations</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                style={{ height: '36px', fontSize: '0.8125rem' }}
                value={userForm.password}
                onChange={handleUserInputChange}
                disabled={registering}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '38px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: '700', gap: '0.35rem' }} disabled={registering}>
              {registering ? (
                <>
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
