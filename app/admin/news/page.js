'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Newspaper
} from 'lucide-react';
import { PageHeader, Button, Input, Select, Table } from '@/app/admin/components/DesignSystem';

export default function NewsManagement() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, filter, sorting, pagination states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all news from Supabase
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setNews(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch news from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Actions
  const handleTogglePublish = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      const { error: updateError } = await supabase
        .from('news')
        .update({ status: nextStatus })
        .eq('id', item.id);

      if (updateError) throw updateError;
      
      setNews(news.map(n => n.id === item.id ? { ...n, status: nextStatus } : n));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `News Status Changed`,
        details: `News article "${item.title}" set to ${nextStatus}`
      });
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (newsId, newsTitle) => {
    if (!confirm(`Are you sure you want to delete "${newsTitle}"?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

      if (deleteError) throw deleteError;

      setNews(news.filter(n => n.id !== newsId));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `News Deleted`,
        details: `News article "${newsTitle}" was deleted`
      });
    } catch (err) {
      alert(err.message || 'Failed to delete news article');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      const { id, created_at, ...duplicateData } = item;
      const newNews = {
        ...duplicateData,
        title: `${item.title} (Copy)`,
        slug: `${item.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft'
      };

      const { data, error: insertError } = await supabase
        .from('news')
        .insert(newNews)
        .select()
        .single();

      if (insertError) throw insertError;

      setNews([data, ...news]);
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `News Added`,
        details: `Duplicated news article "${item.title}" as "${data.title}"`
      });
    } catch (err) {
      alert(err.message || 'Failed to duplicate news article');
    }
  };

  // Sorting helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Unique list of categories
  const categories = [...new Set(news.map(n => n.category).filter(Boolean))].sort();

  // Filtered & Sorted news
  const filteredNews = news
    .filter(item => {
      const matchSearch = 
        (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.slug || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = !filterCategory || item.category === filterCategory;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination helper
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerAction = (
    <Link href="/admin/news/new">
      <Button variant="primary" size="medium" icon={Plus}>
        Create News
      </Button>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="EV News" 
        description="Write and manage breaking news, press releases, and industry alerts."
        action={headerAction}
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search title, description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          icon={Search}
        />

        {/* Category Filter */}
        <Select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        {/* Status Filter */}
        <Select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Main Table view */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide">Fetching news database...</p>
          </div>
        ) : paginatedNews.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm bg-white border border-slate-200 rounded-2xl shadow-sm font-medium">
            No news articles matched your filters.
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="p-4 pl-6 w-16">Cover</th>
                  <th className="p-4 cursor-pointer hover:text-slate-800 select-none min-w-[250px]" onClick={() => handleSort('title')}>
                    <span className="flex items-center gap-1.5">Title <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-800 select-none" onClick={() => handleSort('category')}>
                    <span className="flex items-center gap-1.5">Category <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-800 select-none" onClick={() => handleSort('date')}>
                    <span className="flex items-center gap-1.5">Published Date <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-800 text-center select-none" onClick={() => handleSort('status')}>
                    <span className="flex items-center justify-center gap-1.5">Status <ArrowUpDown className="w-3.5 h-3.5" /></span>
                  </th>
                  <th className="p-4 pr-6 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150 group">
                    <td className="p-4 pl-6">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[9px] font-extrabold text-slate-400 uppercase"><Newspaper className="w-4 h-4 text-slate-400" /></div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      <div>
                        {item.title}
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">/{item.slug}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{item.category || 'Uncategorized'}</td>
                    <td className="p-4 font-medium text-slate-500">{new Date(item.date || item.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none cursor-pointer border transition-all ${
                          item.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        {item.status === 'published' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/news/${item.slug}`}
                          target="_blank"
                        >
                          <Button variant="ghost" size="small" className="p-1.5 text-slate-400 hover:text-slate-700" title="Preview article">
                            <Eye className="w-4.5 h-4.5" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          className="p-1.5 text-slate-400 hover:text-slate-700" 
                          title="Duplicate article"
                          onClick={() => handleDuplicate(item)}
                        >
                          <Copy className="w-4.5 h-4.5" />
                        </Button>
                        <Link href={`/admin/news/${item.id}`}>
                          <Button variant="ghost" size="small" className="p-1.5 text-slate-400 hover:text-[#1e40af]" title="Edit article">
                            <Edit className="w-4.5 h-4.5" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          className="p-1.5 text-slate-400 hover:text-red-650" 
                          title="Delete article"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} articles
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-slate-750 font-bold px-2">{currentPage} / {totalPages}</span>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
