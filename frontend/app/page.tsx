import Link from 'next/link';
import { getRestaurants } from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/lib/types';

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  let featuredRestaurants: Restaurant[] = [];

  try {
    const res = await getRestaurants({ limit: 6 });
    const list = res?.restaurants || res?.data?.restaurants;
    if (list) {
      featuredRestaurants = list;
    }
  } catch (err) {
    console.error('Error loading featured restaurants for home page:', err);
  }

  return (
    <div>
      {/* ── 1. Hero Section ────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          paddingTop: '5rem',
          paddingBottom: '6rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.15), transparent 70%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span className="badge badge-gold" style={{ marginBottom: '1.25rem' }}>
            ✨ Guaranteed Real-Time Table Reservations
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              maxWidth: '850px',
              margin: '0 auto 1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Fine Dining Reservations,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Without the Wait
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.7',
            }}
          >
            Explore top culinary destinations, check live table availability, and secure your dining experience with instant OTP confirmation.
          </p>

          {/* Quick Search Widget */}
          <form
            action="/explore"
            method="GET"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(20px)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
              <span style={{ marginRight: '0.6rem', color: 'var(--text-muted)' }}>🔍</span>
              <input
                type="text"
                name="search"
                placeholder="Restaurant name or cuisine..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div style={{ flex: '0 1 150px', display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
              <span style={{ marginRight: '0.4rem', color: 'var(--text-muted)' }}>📍</span>
              <select
                name="city"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>All Cities</option>
                <option value="Lagos" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Lagos</option>
                <option value="Abuja" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Abuja</option>
                <option value="Port Harcourt" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Port Harcourt</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
              Find Table ➔
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
              marginTop: '1.75rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Popular:</span>
            <Link href="/explore?cuisine=Italian" className="badge badge-muted">🍝 Italian</Link>
            <Link href="/explore?cuisine=African" className="badge badge-muted">🍲 African</Link>
            <Link href="/explore?cuisine=Asian" className="badge badge-muted">🍣 Asian</Link>
            <Link href="/explore?city=Lagos" className="badge badge-muted">📍 Lagos</Link>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Restaurants Grid ───────────────────────────────────── */}
      <section style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                Curated Selection
              </span>
              <h2 style={{ fontSize: '2.2rem', color: '#fff' }}>Featured Restaurants</h2>
            </div>
            <Link href="/explore" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
              View All Directory ➔
            </Link>
          </div>

          {featuredRestaurants.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No restaurants found yet.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Start your backend server (`npm run dev` at localhost:8000) or check the database to seed restaurants.
              </p>
            </div>
          ) : (
            <div className="grid-responsive">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. How It Works Section ────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-glass)',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
              Simple & Reliable
            </span>
            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.75rem' }}>
              How VelvetTable Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              We eliminate reservation friction with transactional seat locking and automated email dispatch.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Step 1 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  marginBottom: '1.25rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.6rem' }}>
                Discover & Select
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Browse menus, cuisine styles, and explore 7-day live table availability for your ideal party size.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  marginBottom: '1.25rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.6rem' }}>
                Verify in 1-Click
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Guests verify instantly with a 6-digit email OTP; logged-in customers skip OTP directly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  marginBottom: '1.25rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.6rem' }}>
                Dine with Peace of Mind
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Receive real-time owner status emails and automated 10-minute reminders before your reservation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
