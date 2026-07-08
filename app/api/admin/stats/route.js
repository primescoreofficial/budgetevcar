import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllCars } from '@/lib/queries';
import { getAllPosts } from '@/lib/content';

import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Use request-specific Supabase client to respect RLS policies
    const supabaseClient = token 
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
      : supabase;

    // 1. Cars stats
    const cars = await getAllCars();
    const totalCars = cars.length;
    const recentCars = [...cars]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    // 2. Blogs stats (Try Supabase, fallback to markdown)
    let totalBlogs = 0;
    let recentBlogs = [];
    try {
      const { data, error } = await supabaseClient
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        totalBlogs = data.length;
        recentBlogs = data.slice(0, 5);
      } else {
        const localBlogs = getAllPosts('blogs');
        totalBlogs = localBlogs.length;
        recentBlogs = localBlogs.slice(0, 5);
      }
    } catch (e) {
      const localBlogs = getAllPosts('blogs');
      totalBlogs = localBlogs.length;
      recentBlogs = localBlogs.slice(0, 5);
    }

    // 3. News stats (Try Supabase, fallback to markdown)
    let totalNews = 0;
    let recentNews = [];
    try {
      const { data, error } = await supabaseClient
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        totalNews = data.length;
        recentNews = data.slice(0, 5);
      } else {
        const localNews = getAllPosts('news');
        totalNews = localNews.length;
        recentNews = localNews.slice(0, 5);
      }
    } catch (e) {
      const localNews = getAllPosts('news');
      totalNews = localNews.length;
      recentNews = localNews.slice(0, 5);
    }

    // 4. Activity Logs (fetch from Supabase if table exists, fallback to empty array)
    let activityLogs = [];
    try {
      const { data, error } = await supabaseClient
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        activityLogs = data;
      }
    } catch (e) {
      console.warn('Could not fetch activity logs:', e);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCars,
        totalBlogs,
        totalNews,
      },
      recent: {
        cars: recentCars,
        blogs: recentBlogs,
        news: recentNews,
      },
      activityLogs,
    });
  } catch (error) {
    console.error('Error in admin stats API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
