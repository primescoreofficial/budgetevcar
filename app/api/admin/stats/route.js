import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllCars } from '@/lib/queries';
import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Cars stats
    const cars = await getAllCars();
    const totalCars = cars.length;
    const recentCars = [...cars]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // 2. Blogs stats
    const blogs = getAllPosts('blogs');
    const totalBlogs = blogs.length;
    const recentBlogs = [...blogs].slice(0, 5);

    // 3. News stats
    const news = getAllPosts('news');
    const totalNews = news.length;
    const recentNews = [...news].slice(0, 5);

    // 4. Activity Logs (fetch from Supabase if table exists, fallback to empty array or mock)
    let activityLogs = [];
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        activityLogs = data;
      }
    } catch (e) {
      console.warn('Could not fetch activity logs, database table may not exist yet:', e);
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
