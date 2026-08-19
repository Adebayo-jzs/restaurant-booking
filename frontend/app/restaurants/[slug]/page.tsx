import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRestaurantByIdOrSlug } from '@/lib/api';
import RestaurantJsonLd from '@/components/JsonLd';
import RestaurantDetailClient from './RestaurantDetailClient';

interface RestaurantPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ── Dynamic SEO Metadata (Extracts Restaurant Name & Details from DB) ─────────
export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await getRestaurantByIdOrSlug(slug);
    const restaurant = res?.data || res?.restaurant;
    if (!restaurant) {
      return {
        title: 'Restaurant Not Found | VelvetTable',
        description: 'The requested restaurant could not be located.',
      };
    }

    const title = `${restaurant.name} - ${restaurant.cuisine} Restaurant in ${restaurant.city} | Table Reservations`;
    const description =
      restaurant.description ||
      `Reserve a table at ${restaurant.name} in ${restaurant.city}. Enjoy authentic ${restaurant.cuisine} dining with live table availability and instant booking.`;

    const images = restaurant.coverImage ? [restaurant.coverImage] : [];

    return {
      title,
      description,
      keywords: [
        restaurant.name,
        `${restaurant.cuisine} restaurant`,
        `Dining in ${restaurant.city}`,
        `Book table at ${restaurant.name}`,
        'VelvetTable reservations',
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: 'Restaurant Details | VelvetTable',
      description: 'Book your table online with instant confirmation.',
    };
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;

  let restaurant = null;

  try {
    const res = await getRestaurantByIdOrSlug(slug);
    if (res?.data || res?.restaurant) {
      restaurant = res.data || res.restaurant;
    }
  } catch (error) {
    console.error('Error fetching restaurant page:', error);
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <>
      {/* Injects Schema.org JSON-LD structured data for Google Rich Results */}
      <RestaurantJsonLd restaurant={restaurant} />
      <RestaurantDetailClient restaurant={restaurant} />
    </>
  );
}
