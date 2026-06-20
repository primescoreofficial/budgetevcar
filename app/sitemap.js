import { getAllCars, getCarUrl } from '@/lib/queries';

export default async function sitemap() {
  const baseUrl = 'https://budgetevcar.com';

  let carUrls = [];
  try {
    const cars = await getAllCars();
    carUrls = cars.map((car) => ({
      url: `${baseUrl}${getCarUrl(car)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to generate dynamic urls for sitemap:', error);
  }

  const routes = ['', '/find-ev', '/compare', '/calculator', '/charging-stations'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.9,
  }));

  return [...routes, ...carUrls];
}
