'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { AuthResponse } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const user = res?.data?.user;
      const token = res?.data?.token;

      if (user && token) {
        login(token, user);
        if (user.role === 'OWNER') {
          router.push('/owner/dashboard');
        } else {
          router.push('/my-bookings');
        }
      } else {
        throw new Error('Invalid response from authentication server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoOwner = () => {
    setEmail('calmsp0+owner1@gmail.com');
    setPassword('passwword');
  };

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.4rem',
              }}
            >
              🍽️
            </div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.4rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Log in to manage your dining reservations or restaurant tables.
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

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In ➔'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Testing Shortcut:
            </p>
            <button
              type="button"
              onClick={fillDemoOwner}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              ⚡ Fill Demo Owner Credentials
            </button>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
