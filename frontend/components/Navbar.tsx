'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: scrolled ? 'rgba(10, 12, 16, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-glass)' : '1px solid transparent',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}
          >
            🍽️
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.3rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Velvet<span style={{ color: 'var(--accent-gold)', WebkitTextFillColor: 'var(--accent-gold)' }}>Table</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: pathname === '/' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Home
          </Link>
          <Link
            href="/explore"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: pathname.startsWith('/explore') ? 'var(--accent-gold)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Explore Restaurants
          </Link>
          <Link
            href="/my-bookings"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: pathname.startsWith('/my-bookings') ? 'var(--accent-gold)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            My Bookings
          </Link>
          <Link
            href="/owner/dashboard"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: pathname.startsWith('/owner') ? 'var(--accent-gold)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Owner Portal
          </Link>
        </nav>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/explore" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Book a Table ✨
          </Link>
        </div>
      </div>
    </header>
  );
}
