'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Booking } from '@/lib/types';
import { getUserBookings, cancelBooking } from '@/lib/api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserBookings();
      if (res?.data) {
        setBookings(res.data);
      }
    } catch (err: unknown) {
      console.error('Could not load user bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setActionLoadingId(bookingId);
    setMessage('');

    try {
      await cancelBooking(bookingId);
      // Optimistic status update
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setMessage('Reservation cancelled successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel reservation.';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-emerald">✓ Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-gold">⏳ Pending Approval</span>;
      case 'REJECTED':
        return <span className="badge badge-rose">✕ Rejected</span>;
      case 'CANCELLED':
        return <span className="badge badge-muted">Cancelled</span>;
      default:
        return <span className="badge badge-muted">{status}</span>;
    }
  };

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
              Reservation Center
            </span>
            <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>My Bookings</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your upcoming reservations and check real-time approval status.
            </p>
          </div>

          <Link href="/explore" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
            + Book Another Table
          </Link>
        </div>

        {message && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-emerald)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Loading your reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
              No Reservations Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              You haven&apos;t made any dining reservations yet. Explore top restaurants and reserve your table!
            </p>
            <Link href="/explore" className="btn btn-primary">
              Find a Table Now ➔
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((b) => {
              const formattedDate = new Date(b.bookingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED';

              return (
                <div
                  key={b.id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        width: '3.2rem',
                        height: '3.2rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      🍽️
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                          {b.restaurant?.name || 'Restaurant Reservation'}
                        </h3>
                        {getStatusBadge(b.status)}
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        🗓️ {formattedDate} at ⏰ {b.bookingTime} • 👥 {b.numberOfPeople} {b.numberOfPeople === 1 ? 'Guest' : 'Guests'}
                      </p>
                      {b.specialRequests && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                          Note: &quot;{b.specialRequests}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={actionLoadingId === b.id}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        {actionLoadingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
