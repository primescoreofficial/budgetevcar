import { getAllCars, getCarUrl, getUniqueBrands, getUniqueBodyTypes } from '@/lib/queries';
import { getAllPosts } from '@/lib/content';

export default async function sitemap() {
  const baseUrl = 'https://budgetevcar.com';

  // ── DYNAMIC CAR URLS ──
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
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error('Failed to generate dynamic urls for sitemap:', error);
  }

  // ── DYNAMIC BLOG & NEWS URLS ──
  let contentUrls = [];
  try {
    const blogs = await getAllPosts('blogs');
    const news = await getAllPosts('news');


    // Add blogs
    blogs.forEach(post => {
      contentUrls.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Add categories
    const categories = [...new Set(blogs.map(p => p.category).filter(Boolean))];
    categories.forEach(cat => {
      const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
      contentUrls.push({
        url: `${baseUrl}/blog/category/${catSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // Add tags
    const tags = [...new Set(blogs.flatMap(p => p.tags || []).filter(Boolean))];
    tags.forEach(tag => {
      const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
      contentUrls.push({
        url: `${baseUrl}/blog/tag/${tagSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });

    // Add news
    news.forEach(item => {
      contentUrls.push({
        url: `${baseUrl}/news/${item.slug}`,
        lastModified: new Date(item.date),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Add authors
    const authors = [...new Set([...blogs, ...news].map(p => p.author).filter(Boolean))];
    authors.forEach(auth => {
      contentUrls.push({
        url: `${baseUrl}/author/${auth}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });

  } catch (error) {
    console.error('Failed to generate content urls for sitemap:', error);
  }

  // ── BRAND-SPECIFIC FIND EV LANDING PAGES ──
  let brandUrls = [];
  try {
    const brands = await getUniqueBrands();
    brands.forEach(brand => {
      brandUrls.push({
        url: `${baseUrl}/find-ev?brand=${encodeURIComponent(brand)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error('Failed to generate brand urls for sitemap:', error);
  }

  // ── BODY TYPE FILTER LANDING PAGES ──
  const bodyTypeUrls = ['Hatchback', 'SUV', 'Sedan', 'Compact'].map(bodyType => ({
    url: `${baseUrl}/find-ev?bodyType=${encodeURIComponent(bodyType)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // ── BUDGET FILTER LANDING PAGES ──
  const budgetUrls = [
    { slug: 'under-10', label: 'Under 10 Lakh' },
    { slug: '10-15', label: '10 to 15 Lakh' },
    { slug: '15-20', label: '15 to 20 Lakh' },
    { slug: 'above-20', label: 'Above 20 Lakh' },
  ].map(budget => ({
    url: `${baseUrl}/find-ev?budget=${budget.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // ── STATIC ROUTES ──
  const routes = [
    '',
    '/find-ev',
    '/compare',
    '/charging-stations',
    '/tools',
    '/tools/ev-emi-calculator',
    '/tools/ev-running-cost-calculator',
    '/tools/ev-savings-calculator',
    '/tools/ev-charging-time-calculator',
    '/blog',
    '/news'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'daily',
    priority: route === '' ? 1.0 : (route === '/find-ev' ? 0.95 : route.startsWith('/tools/') ? 0.85 : 0.9),
  }));

  return [...routes, ...carUrls, ...brandUrls, ...bodyTypeUrls, ...budgetUrls, ...contentUrls];
}
