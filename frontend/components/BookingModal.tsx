import { useState } from 'react';
import { Restaurant, Booking } from '@/lib/types';
import { createBooking, verifyGuestBooking } from '@/lib/api';

interface BookingModalProps {
  restaurant: Restaurant;
  selectedDate: string;
  selectedTime: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({
  restaurant,
  selectedDate,
  selectedTime,
  isOpen,
  onClose,
}: BookingModalProps) {
  // Form State
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Flow State: 'FORM' | 'OTP' | 'SUCCESS'
  const [step, setStep] = useState<'FORM' | 'OTP' | 'SUCCESS'>('FORM');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await createBooking(restaurant.id, {
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        numberOfPeople,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests: specialRequests || undefined,
      });

      if (res.data) {
        setCreatedBooking(res.data);
        if (res.data.isVerified) {
          setStep('SUCCESS');
        } else {
          setStep('OTP');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create booking. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdBooking?.id || !otp) return;
    setError('');
    setLoading(true);

    try {
      const res = await verifyGuestBooking(createdBooking.id, otp);
      if (res.success) {
        setStep('SUCCESS');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired OTP code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formattedDateStr = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
              Table Reservation
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>{restaurant.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              🗓️ {formattedDateStr} at ⏰ {selectedTime}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
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
              marginBottom: '1.25rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Main Reservation Form */}
        {step === 'FORM' && (
          <form onSubmit={handleBookingSubmit}>
            {/* Party Size */}
            <div className="form-group">
              <label className="form-label">Number of Guests</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumberOfPeople(num)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: numberOfPeople === num ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                      border: numberOfPeople === num ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                      color: numberOfPeople === num ? '#0f172a' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Details */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jane Doe"
                className="form-input"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="form-input"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234..."
                  className="form-input"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="form-group">
              <label className="form-label">Special Requests (Optional)</label>
              <textarea
                rows={2}
                placeholder="Window seat, anniversary, dietary restrictions..."
                className="form-textarea"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Securing Table...' : 'Confirm & Reserve Table ➔'}
            </button>
          </form>
        )}

        {/* STEP 2: Guest OTP Verification */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 1rem',
              }}
            >
              ✉️
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
              Verify Your Reservation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We have sent a 6-digit verification code to <strong>{guestEmail}</strong>. Enter it below to complete your booking.
            </p>

            <div className="form-group" style={{ maxWidth: '280px', margin: '0 auto 1.5rem' }}>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.35em', fontWeight: 800 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              {loading ? 'Verifying OTP...' : 'Verify & Send to Restaurant ✓'}
            </button>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              🎉
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              Reservation Request Sent!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your table for <strong>{numberOfPeople} guests</strong> at <strong>{restaurant.name}</strong> has been successfully submitted. An email confirmation has been sent to your inbox.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.88rem',
              }}
            >
              <p style={{ color: 'var(--text-muted)' }}>Status: <span className="badge badge-gold">PENDING OWNER CONFIRMATION</span></p>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>Time: <strong style={{ color: '#fff' }}>{selectedTime}, {formattedDateStr}</strong></p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
