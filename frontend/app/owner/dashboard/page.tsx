'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { acceptBooking, rejectBooking, fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Restaurant } from '@/lib/types';

export default function OwnerDashboardPage() {
  const { user, token } = useAuth();
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [myRestaurants, setMyRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  useEffect(() => {
    if (token) {
      loadMyRestaurants();
    }
  }, [token]);

  const loadMyRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const res = await fetchApi<{ success: boolean; data?: Restaurant[]; restaurants?: Restaurant[] }>('/restaurants/my-restaurants', {
        token: token || undefined,
      });
      const list = res.data || res.restaurants || (Array.isArray(res) ? res : []);
      setMyRestaurants(list);
    } catch (err) {
      console.error('Could not load owner restaurants:', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleAccept = async (idToAccept?: string) => {
    const targetId = idToAccept || bookingIdInput.trim();
    if (!targetId) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      await acceptBooking(targetId, token || undefined);
      setStatusMessage({
        type: 'success',
        text: `✓ Booking ${targetId} successfully ACCEPTED! A confirmation email has been dispatched to the guest.`,
      });
      setBookingIdInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept booking.';
      setStatusMessage({
        type: 'error',
        text: `⚠️ ${msg}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (idToReject?: string) => {
    const targetId = idToReject || bookingIdInput.trim();
    if (!targetId) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      await rejectBooking(targetId, token || undefined);
      setStatusMessage({
        type: 'success',
        text: `✓ Booking ${targetId} REJECTED. A notification email has been dispatched to the guest.`,
      });
      setBookingIdInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject booking.';
      setStatusMessage({
        type: 'error',
        text: `⚠️ ${msg}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
              Restaurant Management
            </span>
            <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>Owner Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your dining venues, incoming table reservations, and automated email confirmations.
            </p>
          </div>

          <Link href="/owner/restaurants/new" className="btn btn-primary">
            + Register New Restaurant
          </Link>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: statusMessage.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              marginBottom: '1.5rem',
              fontSize: '0.92rem',
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* My Managed Restaurants Grid */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>
            Your Managed Restaurants
          </h2>

          {loadingRestaurants ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>Loading your venues...</p>
            </div>
          ) : myRestaurants.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                You haven&apos;t registered any restaurants yet or aren&apos;t logged in.
              </p>
              <Link href="/owner/restaurants/new" className="btn btn-secondary" style={{ fontSize: '0.88rem' }}>
                + Add Your First Restaurant
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {myRestaurants.map((rest) => (
                <div key={rest.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{rest.name}</h3>
                    <span className="badge badge-gold">{rest.cuisine}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    📍 {rest.address}, {rest.city}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/restaurants/${rest.slug}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}>
                      View Live Page ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Box */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
            Quick Booking Action
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Enter a booking ID from your owner notification email to instantly Accept or Reject the reservation:
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. cmsz7nr6800032g5a5nrz81eo"
              value={bookingIdInput}
              onChange={(e) => setBookingIdInput(e.target.value)}
              className="form-input"
              style={{ flex: '1 1 280px' }}
            />
            <button
              onClick={() => handleAccept()}
              disabled={actionLoading || !bookingIdInput.trim()}
              className="btn btn-success"
              style={{ padding: '0.7rem 1.4rem' }}
            >
              ✓ Accept Booking
            </button>
            <button
              onClick={() => handleReject()}
              disabled={actionLoading || !bookingIdInput.trim()}
              className="btn btn-danger"
              style={{ padding: '0.7rem 1.4rem' }}
            >
              ✕ Reject
            </button>
          </div>
        </div>

        {/* System Diagnostics Info */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>
            ⚡ System Automation Pipeline
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <li>✓ <strong>Pessimistic Concurrency Locking:</strong> Prevents overbooking simultaneously submitted tables.</li>
            <li>✓ <strong>Automated Reminders:</strong> Background cron worker automatically triggers reminders 10 minutes prior to booking.</li>
            <li>✓ <strong>Email Notifications:</strong> Real-time HTML dispatch via SendByte API.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
