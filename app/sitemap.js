import { getAllCars, getCarUrl } from '@/lib/queries';
import { getAllPosts } from '@/lib/content';

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

  // Dynamic Blog & News URLs
  let contentUrls = [];
  try {
    const blogs = getAllPosts('blogs');
    const news = getAllPosts('news');

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
    '/tools/ev-charging-time-calculator',
    '/blog',
    '/news'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : (route.startsWith('/tools/') ? 0.8 : 0.9),
  }));

  return [...routes, ...carUrls, ...contentUrls];
}
