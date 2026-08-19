'use client';

import { useState } from 'react';
import { Restaurant } from '@/lib/types';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingModal from '@/components/BookingModal';

interface RestaurantDetailClientProps {
  restaurant: Restaurant;
}

export default function RestaurantDetailClient({ restaurant }: RestaurantDetailClientProps) {
  const defaultCover =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80';
  const cover = restaurant.coverImage || defaultCover;

  // Selected date defaults to first availability date or today
  const defaultDate =
    restaurant.availabilities && restaurant.availabilities.length > 0
      ? restaurant.availabilities[0].date
      : new Date().toISOString();

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState(
    restaurant.availabilities && restaurant.availabilities[0]?.timeSlots?.[0]?.time || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* ── 1. Header Banner ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '420px', width: '100%', overflow: 'hidden' }}>
        <img
          src={cover}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(10, 12, 16, 0.4) 60%, rgba(10, 12, 16, 0.8) 100%)',
          }}
        />

        <div
          className="container"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: 0,
            right: 0,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">{restaurant.cuisine} Cuisine</span>
              {restaurant.isVerified && <span className="badge badge-emerald">Verified Restaurant</span>}
              {restaurant.startingPrice && <span className="badge badge-muted">From ${restaurant.startingPrice}/person</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginBottom: '0.5rem' }}>
              {restaurant.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span> {restaurant.address}, {restaurant.city}, {restaurant.country}
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedTime}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
            >
              Reserve Table Now ➔
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Main Content Grid ─────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: About & Details */}
          <div>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>
                About the Restaurant
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.75rem' }}>
                {restaurant.description ||
                  `Welcome to ${restaurant.name}. We specialize in high-quality ${restaurant.cuisine} dishes crafted with the finest ingredients.`}
              </p>

              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>
                Dining Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Phone Contact:</span>
                  <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>{restaurant.phoneNumber}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Email Inquiries:</span>
                  <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>{restaurant.email}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Seating Capacity:</span>
                  <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>
                    {restaurant.capacity ? `${restaurant.capacity} Guests` : 'Full Dining Room'}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Booking Confirmation:</span>
                  <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '0.2rem' }}>Instant Verification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Table Availability Selector */}
          <div>
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                border: '1px solid var(--border-glow)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
                  Live Table Availability
                </span>
                <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Select Date & Time</h2>
              </div>

              <TimeSlotPicker
                availabilities={restaurant.availabilities}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={(d) => setSelectedDate(d)}
                onSelectTime={(t) => setSelectedTime(t)}
              />

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!selectedTime}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                >
                  {selectedTime ? `Book for ${selectedTime} ➔` : 'Select a Time Slot to Reserve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        restaurant={restaurant}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
