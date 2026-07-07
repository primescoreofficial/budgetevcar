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
  BookOpen
} from 'lucide-react';
import { PageHeader, Button, Input, Select, Table } from '@/app/admin/components/DesignSystem';

export default function BlogsManagement() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
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

  // Fetch all blogs from Supabase
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setBlogs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch blogs from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Actions
  const handleTogglePublish = async (blog) => {
    const nextStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ status: nextStatus })
        .eq('id', blog.id);

      if (updateError) throw updateError;
      
      setBlogs(blogs.map(b => b.id === blog.id ? { ...b, status: nextStatus } : b));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Blog Status Changed`,
        details: `Blog "${blog.title}" set to ${nextStatus}`
      });
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (blogId, blogTitle) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (deleteError) throw deleteError;

      setBlogs(blogs.filter(b => b.id !== blogId));
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Blog Deleted`,
        details: `Blog "${blogTitle}" was deleted`
      });
    } catch (err) {
      alert(err.message || 'Failed to delete blog');
    }
  };

  const handleDuplicate = async (blog) => {
    try {
      const { id, created_at, ...duplicateData } = blog;
      const newBlog = {
        ...duplicateData,
        title: `${blog.title} (Copy)`,
        slug: `${blog.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft'
      };

      const { data, error: insertError } = await supabase
        .from('blogs')
        .insert(newBlog)
        .select()
        .single();

      if (insertError) throw insertError;

      setBlogs([data, ...blogs]);
      
      // Activity Log
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: `Blog Added`,
        details: `Duplicated blog "${blog.title}" as "${data.title}"`
      });
    } catch (err) {
      alert(err.message || 'Failed to duplicate blog');
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
  const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))].sort();

  // Filtered & Sorted blogs
  const filteredBlogs = blogs
    .filter(blog => {
      const matchSearch = 
        (blog.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (blog.slug || '').toLowerCase().includes(search.toLowerCase()) ||
        (blog.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = !filterCategory || blog.category === filterCategory;
      const matchStatus = !filterStatus || blog.status === filterStatus;
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
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerAction = (
    <Link href="/admin/blogs/new">
      <Button variant="primary" size="medium" icon={Plus}>
        Create Blog
      </Button>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="EV Blogs & Guides" 
        description="Write and manage articles, purchase advice, and tutorials."
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
            <p className="text-xs text-slate-500 font-semibold tracking-wide">Fetching blogs database...</p>
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm bg-white border border-slate-200 rounded-2xl shadow-sm font-medium">
            No articles matched your filters.
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
                {paginatedBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition duration-150 group">
                    <td className="p-4 pl-6">
                      {blog.image ? (
                        <img 
                          src={blog.image} 
                          alt={blog.title} 
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[9px] font-extrabold text-slate-400 uppercase"><BookOpen className="w-4 h-4 text-slate-400" /></div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      <div>
                        {blog.title}
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">/{blog.slug}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{blog.category || 'Uncategorized'}</td>
                    <td className="p-4 font-medium text-slate-500">{new Date(blog.date || blog.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleTogglePublish(blog)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none cursor-pointer border transition-all ${
                          blog.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        {blog.status === 'published' ? (
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
                          href={`/blog/${blog.slug}`}
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
                          onClick={() => handleDuplicate(blog)}
                        >
                          <Copy className="w-4.5 h-4.5" />
                        </Button>
                        <Link href={`/admin/blogs/${blog.id}`}>
                          <Button variant="ghost" size="small" className="p-1.5 text-slate-400 hover:text-[#1e40af]" title="Edit article">
                            <Edit className="w-4.5 h-4.5" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          className="p-1.5 text-slate-400 hover:text-red-650" 
                          title="Delete article"
                          onClick={() => handleDelete(blog.id, blog.title)}
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} articles
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
