import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'VelvetTable | Premier Restaurant Table Reservations & Dining Directory',
    template: '%s | VelvetTable',
  },
  description:
    'Discover top-rated restaurants, browse verified real-time table availability, and book your next dining reservation in seconds.',
  keywords: [
    'Restaurant booking',
    'Table reservations',
    'Fine dining Lagos',
    'Restaurant directory',
    'Reserve table online',
    'Food and drinks',
  ],
  openGraph: {
    title: 'VelvetTable | Premier Restaurant Table Reservations',
    description:
      'Book tables at premier restaurants in real-time with guaranteed seat reservation and instant email confirmation.',
    siteName: 'VelvetTable',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VelvetTable | Premier Restaurant Table Reservations',
    description:
      'Book tables at premier restaurants in real-time with guaranteed seat reservation and instant email confirmation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '80vh' }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
