'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Car, 
  BookOpen, 
  Newspaper, 
  Plus, 
  Clock, 
  ArrowRight, 
  Loader2, 
  Activity,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '@/app/admin/components/DesignSystem';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  const { stats, recent, activityLogs } = data || {
    stats: { totalCars: 0, totalBlogs: 0, totalNews: 0 },
    recent: { cars: [], blogs: [], news: [] },
    activityLogs: []
  };

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/admin/cars/new">
        <Button variant="primary" size="medium" icon={Plus}>
          Add Car
        </Button>
      </Link>
      <Link href="/admin/blogs/new">
        <Button variant="secondary" size="medium" icon={Plus}>
          Add Blog
        </Button>
      </Link>
      <Link href="/admin/news/new">
        <Button variant="secondary" size="medium" icon={Plus}>
          Add News
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <PageHeader 
        title="Dashboard" 
        description="Real-time status of your BudgetEV application content."
        action={actionButtons}
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Cars', value: stats.totalCars, icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Vehicles in DB' },
          { title: 'Total Blogs', value: stats.totalBlogs, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Guides published' },
          { title: 'Total News', value: stats.totalNews, icon: Newspaper, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Articles published' },
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            key={stat.title}
          >
            <Card hover={true} className="flex flex-col justify-between h-40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-extrabold text-white mt-3 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-auto font-medium">{stat.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail sections layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Logs (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-900 pb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-white tracking-tight">System Activity Logs</h2>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[480px] pr-2 custom-scrollbar">
              {activityLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  No activity logs recorded. Run the database configuration SQL script to enable tracking.
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:border-slate-800/80 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold text-slate-200">{log.action}</p>
                        <span className="text-[10px] text-slate-500 font-semibold shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {log.details && <p className="text-xs text-slate-400 mt-1">{log.details}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="default" className="text-[9px] lowercase font-semibold text-slate-400">
                          <User className="w-2.5 h-2.5 mr-1" /> {log.admin_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Side Items Panel (Takes 1 column) */}
        <div className="space-y-6">
          
          {/* Recently Added Cars */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
                <Car className="w-4 h-4 text-blue-500" /> Recent Vehicles
              </h2>
              <Link href="/admin/cars">
                <Button variant="ghost" size="small" className="text-xs text-blue-500 font-bold hover:underline">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recent.cars.length === 0 ? (
                <p className="text-xs text-slate-500">No cars stored.</p>
              ) : (
                recent.cars.map((car) => (
                  <div key={car.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-950/40 border border-transparent hover:border-slate-900 transition-all duration-200">
                    {car.vehicle_image ? (
                      <img src={car.vehicle_image} alt={car.model_name} className="w-10 h-8 object-cover rounded-lg border border-slate-800 bg-slate-900" />
                    ) : (
                      <div className="w-10 h-8 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-650">EV</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{car.brand} {car.model_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{car.variant_name || 'Standard configuration'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Blogs */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Recent Blogs
              </h2>
              <Link href="/admin/blogs">
                <Button variant="ghost" size="small" className="text-xs text-emerald-500 font-bold hover:underline">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recent.blogs.length === 0 ? (
                <p className="text-xs text-slate-500">No blogs posted.</p>
              ) : (
                recent.blogs.map((blog) => (
                  <div key={blog.slug} className="p-2.5 rounded-xl hover:bg-slate-950/40 border border-transparent hover:border-slate-900 transition-all duration-200">
                    <p className="text-xs font-bold text-slate-200 truncate">{blog.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" /> {blog.date ? new Date(blog.date).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
