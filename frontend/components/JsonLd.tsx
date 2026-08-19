import { Restaurant } from '@/lib/types';

interface JsonLdProps {
  restaurant: Restaurant;
}

export default function RestaurantJsonLd({ restaurant }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description || `Reserve a table at ${restaurant.name} in ${restaurant.city}`,
    image: restaurant.coverImage ? [restaurant.coverImage] : [],
    telephone: restaurant.phoneNumber,
    email: restaurant.email,
    servesCuisine: restaurant.cuisine,
    priceRange: restaurant.startingPrice ? `$${restaurant.startingPrice}+` : '$$',
    acceptsReservations: 'True',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressRegion: restaurant.state || restaurant.city,
      addressCountry: restaurant.country,
    },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restaurants/${restaurant.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
