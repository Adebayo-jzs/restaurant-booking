'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { AuthResponse } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: phoneNumber || undefined,
          role,
        }),
      });

      const token = res.accessToken || res.token || (res.data && 'token' in res.data ? (res.data as any).token : undefined);
      const user = (res.data && 'id' in res.data ? (res.data as any) : undefined) || res.user || (res.data && 'user' in res.data ? (res.data as any).user : undefined);

      if (user && token) {
        login(token, user);
        if (user.role === 'OWNER') {
          router.push('/owner/dashboard');
        } else {
          router.push('/my-bookings');
        }
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Join VelvetTable
            </span>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.4rem' }}>
              Create an Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Reserve tables or manage your restaurant profile seamlessly.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-rose)',
                fontSize: '0.88rem',
                marginBottom: '1.5rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Role Toggle */}
            <div className="form-group">
              <label className="form-label">I want to...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: role === 'CUSTOMER' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                    border: role === 'CUSTOMER' ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                    color: role === 'CUSTOMER' ? '#0f172a' : '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  🍷 Book Tables
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: role === 'OWNER' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                    border: role === 'OWNER' ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                    color: role === 'OWNER' ? '#0f172a' : '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  🏢 Manage Restaurant
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+234..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration ➔'}
            </button>
          </form>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
