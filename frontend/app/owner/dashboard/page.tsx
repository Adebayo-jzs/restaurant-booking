'use client';

import { useState } from 'react';
import { acceptBooking, rejectBooking } from '@/lib/api';

export default function OwnerDashboardPage() {
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAccept = async (idToAccept?: string) => {
    const targetId = idToAccept || bookingIdInput.trim();
    if (!targetId) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      await acceptBooking(targetId);
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
      await rejectBooking(targetId);
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
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
            Restaurant Management
          </span>
          <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage incoming table reservations with real-time customer email dispatch.
          </p>
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
