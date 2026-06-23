import { getAllCars, getCarUrl } from '@/lib/queries';

export default async function sitemap() {
  const baseUrl = 'https://budgetevcar.com';

  let carUrls = [];
  try {
    const cars = await getAllCars();
    const seenUrls = new Set();
    
    cars.forEach((car) => {
      const urlPath = getCarUrl(car).split('?')[0];
      const fullUrl = `${baseUrl}${urlPath}`;
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        carUrls.push({
          url: fullUrl,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (error) {
    console.error('Failed to generate dynamic urls for sitemap:', error);
  }

  const routes = [
    '',
    '/find-ev',
    '/compare',
    '/calculator',
    '/charging-stations',
    '/tools',
    '/tools/ev-emi-calculator',
    '/tools/ev-running-cost-calculator',
    '/tools/ev-savings-calculator',
    '/tools/ev-charging-time-calculator'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : (route.startsWith('/tools/') ? 0.8 : 0.9),
  }));


  return [...routes, ...carUrls];
}
