import { Metadata } from 'next';
import { getRestaurants } from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/lib/types';
import Link from 'next/link';

interface ExplorePageProps {
  searchParams: Promise<{
    city?: string;
    cuisine?: string;
    search?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const city = resolvedParams.city || 'All Cities';
  const cuisine = resolvedParams.cuisine || 'All Cuisines';

  return {
    title: `Explore Restaurants in ${city} - ${cuisine} Dining | VelvetTable`,
    description: `Discover and reserve tables at top-rated restaurants in ${city}. Browse live availability, menus, and verified reviews.`,
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const city = resolvedParams.city || '';
  const cuisine = resolvedParams.cuisine || '';
  const search = resolvedParams.search || '';
  const page = parseInt(resolvedParams.page || '1', 10);

  let restaurants: Restaurant[] = [];
  let totalCount = 0;

  try {
    const res = await getRestaurants({ city, cuisine, search, page, limit: 12 });
    const list = res?.restaurants || res?.data?.restaurants;
    if (list) {
      restaurants = list;
      totalCount = res.pagination?.total || res.data?.pagination?.total || list.length;
    }
  } catch (err) {
    console.error('Error fetching restaurants on explore page:', err);
  }

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Restaurant Directory
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            Explore Dining Destinations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Found <strong>{totalCount}</strong> dining options matching your criteria.
          </p>
        </div>

        {/* Filters Bar */}
        <form
          method="GET"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
            gap: '1rem',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-glass)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '3rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Keyword Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Name or Dish</label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="e.g. Pasta, Golden Fork..."
              className="form-input"
            />
          </div>

          {/* City Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">City</label>
            <select name="city" defaultValue={city} className="form-select">
              <option value="">All Cities</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
              <option value="Ibadan">Ibadan</option>
            </select>
          </div>

          {/* Cuisine Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Cuisine</label>
            <select name="cuisine" defaultValue={cuisine} className="form-select">
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="African">African</option>
              <option value="Asian">Asian</option>
              <option value="Steakhouse">Steakhouse</option>
              <option value="Continental">Continental</option>
            </select>
          </div>

          {/* Filter Action */}
          <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 1.5rem' }}>
            Filter Results
          </button>
        </form>

        {/* Results Grid */}
        {restaurants.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              No restaurants matched your filters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Try adjusting your city, cuisine, or search keywords to find more options.
            </p>
            <Link href="/explore" className="btn btn-secondary">
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid-responsive">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
