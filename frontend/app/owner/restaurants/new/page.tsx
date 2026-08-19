'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';

export default function NewRestaurantPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [startingPrice, setStartingPrice] = useState<number>(50);
  const [capacity, setCapacity] = useState<number>(100);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [country, setCountry] = useState('Nigeria');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in as an OWNER to register a restaurant.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetchApi<{ success: boolean; data?: any; restaurant?: any }>('/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          cuisine,
          startingPrice: Number(startingPrice),
          capacity: Number(capacity),
          address,
          city,
          country,
          email,
          phoneNumber,
          coverImage: coverImage || undefined,
        }),
        token,
      });

      const restaurant = res.data || res.restaurant;
      if (restaurant?.slug) {
        router.push(`/restaurants/${restaurant.slug}`);
      } else {
        router.push('/owner/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create restaurant.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
            Owner Portal
          </span>
          <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>Register a New Restaurant</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Add your dining destination to the VelvetTable directory to receive live reservations.
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

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          {/* Restaurant Name */}
          <div className="form-group">
            <label className="form-label">Restaurant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. The Golden Fork"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="A modern dining room serving handcrafted local and continental dishes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Cuisine & Starting Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cuisine</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="form-select">
                <option value="Italian">Italian</option>
                <option value="African">African</option>
                <option value="Asian">Asian</option>
                <option value="Steakhouse">Steakhouse</option>
                <option value="Continental">Continental</option>
                <option value="French">French</option>
                <option value="Mediterranean">Mediterranean</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Starting Price ($ / person)</label>
              <input
                type="number"
                min="0"
                required
                value={startingPrice}
                onChange={(e) => setStartingPrice(Number(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          {/* Capacity & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Seating Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Lagos"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Address & Country */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 123 Victoria Island"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Contact Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Inquiry Email</label>
              <input
                type="email"
                required
                placeholder="contact@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+23480..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="form-group">
            <label className="form-label">Cover Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.9rem', fontSize: '1rem' }}
            >
              {loading ? 'Creating Restaurant...' : 'Publish Restaurant ➔'}
            </button>
            <Link href="/owner/dashboard" className="btn btn-secondary" style={{ padding: '0.9rem 1.5rem' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
