import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { getAllCars } from './queries';
import { enrichCarsWithLocalImages } from './imageResolver';
import { supabase } from './supabase';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Helper to sanitize slug for safety
function sanitizeSlug(slug) {
  return slug.replace(/[^a-zA-Z0-9-_]/g, '');
}

export function getAuthorBySlug(slug) {
  try {
    const cleanSlug = sanitizeSlug(slug);
    const filePath = path.join(CONTENT_DIR, 'authors', `${cleanSlug}.json`);
    if (!fs.existsSync(filePath)) {
      // Fallback default author details
      return {
        slug: 'budgetev-team',
        name: 'BudgetEV Team',
        bio: 'Our dedicated team of automotive experts, EV researchers, and product engineers.',
        avatar: '/logo/2.png',
        role: 'Editorial Team'
      };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading author:', error);
    return null;
  }
}

export async function getAllPosts(type = 'blogs', options = {}) {
  let localPosts = [];
  try {
    const dir = path.join(CONTENT_DIR, type);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      localPosts = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const slug = file.replace(/\.md$/, '');
          const filePath = path.join(dir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const { data, content } = matter(fileContent);

          return {
            slug,
            content,
            status: 'published', // Markdown files on disk are treated as published
            ...data
          };
        });
    }
  } catch (error) {
    console.error(`Error loading local posts of type ${type}:`, error);
  }

  // Load from Supabase
  let dbPosts = [];
  try {
    const query = supabase.from(type).select('*');
    const { data, error } = await query;
    if (!error && data) {
      dbPosts = data.map(post => ({
        ...post,
        date: post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
        tags: post.tags || []
      }));
    }
  } catch (e) {
    console.warn(`Could not load posts from database table "${type}":`, e.message);
  }

  // Combine both sources
  let posts = [...localPosts, ...dbPosts];

  // Filter drafts unless explicit options say otherwise
  if (!options.includeDrafts) {
    posts = posts.filter(post => post.status === 'published');
  }

  // Apply filters
  if (options.category) {
    const categoryLower = options.category.toLowerCase().replace(/-/g, ' ');
    posts = posts.filter(post => 
      (post.category || '').toLowerCase() === categoryLower
    );
  }

  if (options.tag) {
    const tagLower = options.tag.toLowerCase().replace(/-/g, ' ');
    posts = posts.filter(post => 
      (post.tags || []).some(t => t.toLowerCase() === tagLower)
    );
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    posts = posts.filter(post => 
      (post.title || '').toLowerCase().includes(searchLower) ||
      (post.description || '').toLowerCase().includes(searchLower) ||
      (post.content || '').toLowerCase().includes(searchLower)
    );
  }

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPostBySlug(slug, type = 'blogs') {
  try {
    const cleanSlug = sanitizeSlug(slug);
    let frontmatter = null;
    let content = '';
    
    // 1. Try local markdown first
    const filePath = path.join(CONTENT_DIR, type, `${cleanSlug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(fileContent);
      frontmatter = parsed.data;
      content = parsed.content;
    } else {
      // 2. Try Supabase
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (!error && data) {
        frontmatter = {
          ...data,
          date: data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
          tags: data.tags || []
        };
        content = data.content || '';
      }
    }

    if (!frontmatter) return null;

    // Convert markdown to html using marked
    const htmlContent = marked.parse(content);

    // Extract headings for Table of Contents (TOC)
    // Matches ## and ### headings
    const headingRegex = /^#{2,3}\s+(.*)$/gm;
    let headingMatch;
    const toc = [];
    let idCounter = 1;

    // We also want to inject ids into heading tags so the TOC links work
    let contentWithHeadingIds = htmlContent;
    
    // We can extract headings from raw content for cleaner matching
    const rawHeadings = [];
    while ((headingMatch = headingRegex.exec(content)) !== null) {
      const title = headingMatch[1].trim();
      const level = headingMatch[0].startsWith('###') ? 3 : 2;
      const id = `heading-${idCounter++}`;
      toc.push({ id, title, level });
      rawHeadings.push({ title, id, level });
    }

    // Add anchors into HTML content
    rawHeadings.forEach(h => {
      const tag = h.level === 3 ? 'h3' : 'h2';
      // Find the tag containing the heading title and replace it with id version
      // E.g. <h2>Title</h2> -> <h2 id="id">Title</h2>
      const escapedTitle = h.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = new RegExp(`<${tag}>(?:\\s*|<strong>)*${escapedTitle}(?:\\s*|<\\/strong>)*<\\/${tag}>`, 'i');
      contentWithHeadingIds = contentWithHeadingIds.replace(
        pattern, 
        `<${tag} id="${h.id}">${h.title}</${tag}>`
      );
    });

    // Resolve Related EVs
    let resolvedEvs = [];
    if (frontmatter.relatedEvs && frontmatter.relatedEvs.length > 0) {
      try {
        const allCars = await getAllCars();
        const matchedEvs = allCars.filter(car => {
          const brand = (car.brand || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const model = (car.model_name || car.detailed_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const carSlug = `${brand}-${model}`.replace(/(^-|-$)+/g, '');
          return frontmatter.relatedEvs.includes(carSlug);
        });
        resolvedEvs = enrichCarsWithLocalImages(matchedEvs);
      } catch (err) {
        console.error('Error resolving related EVs:', err);
      }
    }

    // Get Author
    const author = getAuthorBySlug(frontmatter.author || 'budgetev-team');

    return {
      slug,
      frontmatter,
      contentHtml: contentWithHeadingIds,
      toc,
      author,
      relatedEvs: resolvedEvs
    };
  } catch (error) {
    console.error(`Error loading post by slug ${slug} of type ${type}:`, error);
    return null;
  }
}

export async function getAuthorContributions(authorSlug) {
  const allBlogs = await getAllPosts('blogs');
  const allNews = await getAllPosts('news');
  const blogs = allBlogs.filter(p => p.author === authorSlug);
  const news = allNews.filter(p => p.author === authorSlug);
  return { blogs, news };
}
