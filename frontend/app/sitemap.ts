import { MetadataRoute } from 'next';
import { getRestaurants } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let restaurantRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await getRestaurants({ limit: 100 });
    const list = res?.restaurants || res?.data?.restaurants || [];
    if (list.length > 0) {
      restaurantRoutes = list.map((restaurant) => ({
        url: `${siteUrl}/restaurants/${restaurant.slug}`,
        lastModified: new Date(restaurant.updatedAt || restaurant.createdAt),
        changeFrequency: 'daily',
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...restaurantRoutes];
}
