import Link from 'next/link';
import { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Default fallback food image
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
  const cover = restaurant.coverImage || defaultImage;

  return (
    <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cover Image & Badges */}
      <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
        <img
          src={cover}
          alt={restaurant.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
          className="restaurant-img"
        />
        {/* Dark overlay gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10, 12, 16, 0.9) 0%, transparent 60%)',
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-gold">{restaurant.cuisine}</span>
          {restaurant.isVerified && <span className="badge badge-emerald">Verified</span>}
        </div>

        {/* Starting Price Tag */}
        {restaurant.startingPrice && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.85rem',
              right: '1rem',
              background: 'rgba(10, 12, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-glass)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--accent-gold)',
            }}
          >
            From ${restaurant.startingPrice}
          </div>
        )}
      </div>

      {/* Details Body */}
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
          <Link href={`/restaurants/${restaurant.slug}`} style={{ color: 'inherit' }}>
            {restaurant.name}
          </Link>
        </h3>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {restaurant.description || `Experience exquisite dining at ${restaurant.name} located in the heart of ${restaurant.city}.`}
        </p>

        {/* Address Location Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
          <span>📍</span>
          <span>{restaurant.address}, {restaurant.city}</span>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto' }}>
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem' }}
          >
            View Available Tables ➔
          </Link>
        </div>
      </div>

    </div>
  );
}
