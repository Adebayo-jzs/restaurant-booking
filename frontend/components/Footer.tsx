import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '4rem',
        paddingBottom: '3rem',
        marginTop: '6rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Column 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                🍽️
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#fff',
                }}
              >
                Velvet<span style={{ color: 'var(--accent-gold)' }}>Table</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              Discover premier restaurants, view real-time table availability, and secure guaranteed reservations in seconds.
            </p>
          </div>

          {/* Column 2: Popular Cities */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>Top Dining Cities</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/explore?city=Lagos" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Restaurants in Lagos
                </Link>
              </li>
              <li>
                <Link href="/explore?city=Abuja" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Restaurants in Abuja
                </Link>
              </li>
              <li>
                <Link href="/explore?city=Port+Harcourt" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Restaurants in Port Harcourt
                </Link>
              </li>
              <li>
                <Link href="/explore?city=Ibadan" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Restaurants in Ibadan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Cuisines */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>Featured Cuisines</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/explore?cuisine=Italian" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Italian & Continental
                </Link>
              </li>
              <li>
                <Link href="/explore?cuisine=African" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Traditional African & Grills
                </Link>
              </li>
              <li>
                <Link href="/explore?cuisine=Asian" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Japanese & Asian Fusion
                </Link>
              </li>
              <li>
                <Link href="/explore?cuisine=Steakhouse" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Steakhouses & Fine Dining
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links & Owners */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>For Restaurant Owners</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/owner/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Owner Management Dashboard
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Customer Reservation Center
                </Link>
              </li>
              <li>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚡ Automated Email Confirmations & Reminders
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>© {new Date().getFullYear()} VelvetTable Technologies. All rights reserved.</p>
          <p>Instant table reservations powered by real-time concurrency locking.</p>
        </div>
      </div>
    </footer>
  );
}
