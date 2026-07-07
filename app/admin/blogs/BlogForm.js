'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  Plus,
  X, 
  AlertCircle
} from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, TextArea } from '@/app/admin/components/DesignSystem';

export default function BlogForm({ blogId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!blogId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    description: '',
    category: '',
    tags: [],
    seo_title: '',
    seo_description: '',
    image: '',
    status: 'draft',
    author: 'budgetev-team',
    date: new Date().toISOString().split('T')[0]
  });

  const [newTag, setNewTag] = useState('');

  // Fetch existing blog details
  useEffect(() => {
    if (!blogId) return;
    const fetchBlogDetails = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', blogId)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          const normalized = { ...data };
          Object.keys(normalized).forEach(key => {
            if (normalized[key] === null) {
              if (key === 'tags') {
                normalized[key] = [];
              } else {
                normalized[key] = '';
              }
            }
          });
          
          setFormData({
            title: normalized.title || '',
            slug: normalized.slug || '',
            content: normalized.content || '',
            description: normalized.description || '',
            category: normalized.category || '',
            tags: normalized.tags || [],
            seo_title: normalized.seo_title || '',
            seo_description: normalized.seo_description || '',
            image: normalized.image || '',
            status: normalized.status || 'draft',
            author: normalized.author || 'budgetev-team',
            date: normalized.date ? new Date(normalized.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch article details');
      } finally {
        setFetching(false);
      }
    };
    fetchBlogDetails();
  }, [blogId]);

  // Handle standard field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Auto-generate slug and seo title
      if (name === 'title') {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        next.seo_title = `${value} — BudgetEV`;
      }
      return next;
    });
  };

  // Add/Remove tag helpers
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim();
    if (formData.tags.includes(tag)) return;
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== index)
    }));
  };

  // Upload handler for blogs bucket
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload directly to 'blogs' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message + '. Please ensure a public "blogs" bucket exists in Supabase Storage.');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blogs')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image: publicUrl
      }));
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit Blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('Title and Content are required.');
      }

      const submissionPayload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        tags: formData.tags,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        image: formData.image || null,
        status: formData.status,
        author: formData.author.trim() || 'budgetev-team',
        date: new Date(formData.date).toISOString()
      };

      if (blogId) {
        const { error: updateError } = await supabase
          .from('blogs')
          .update(submissionPayload)
          .eq('id', blogId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('blogs')
          .insert(submissionPayload);

        if (insertError) throw insertError;
      }

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
          action: blogId ? 'Blog Edited' : 'Blog Added',
          details: `Saved blog "${formData.title}"`
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      setSuccess('Blog post saved successfully!');
      setTimeout(() => {
        router.push('/admin/blogs');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save blog post');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
      </div>
    );
  }

  const backAction = (
    <Button 
      variant="secondary" 
      size="medium" 
      icon={ArrowLeft}
      onClick={() => router.push('/admin/blogs')}
    >
      Back
    </Button>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader 
        title={blogId ? 'Edit Blog Post' : 'Create Blog Post'} 
        description="Write guides, tutorials, or updates and set SEO descriptors."
        action={backAction}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content Fields */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Article Content</h2>
            
            <Input
              label="Blog Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 5 Best Electric SUVs in India (2026)"
              required
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="URL Slug (Auto-Generated)"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. best-electric-suvs-india"
                required
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Buying Guide, Ownership"
              />
            </div>

            <TextArea
              label="Short Description / Summary"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief introduction of the article (appears in previews)..."
              className="h-20"
            />

            <TextArea
              label="Body Content (Markdown Supported) *"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="# Introduce your article here..."
              className="h-96 font-mono text-sm leading-relaxed"
              required
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">SEO Parameters</h2>
            <Input
              label="SEO Meta Title"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              placeholder="Search engine title..."
            />
            <TextArea
              label="SEO Meta Description"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              placeholder="Under 160 characters summary for Google search results..."
              className="h-20"
            />
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Publishing</h2>
            
            <Select
              label="Publication Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>

            <Input
              label="Author Alias"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="budgetev-team"
            />

            <Input
              label="Publication Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="large"
                className="w-full"
                icon={Save}
              >
                {loading ? 'Saving...' : 'Save Article'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                className="w-full"
                onClick={() => router.push('/admin/blogs')}
              >
                Cancel
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Tags</h2>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g. range, suv"
              />
              <Button
                type="button"
                variant="secondary"
                className="px-3"
                onClick={handleAddTag}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-xs text-slate-700 rounded-full font-semibold">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Cover Image</h2>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Paste URL or upload image"
                />
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl h-10 transition shrink-0 select-none border border-slate-200">
                  <Upload className="w-4.5 h-4.5" /> Upload File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden" 
                  />
                </label>
              </div>

              {formData.image && (
                <div className="relative w-full aspect-video rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden group">
                  <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

      </form>
    </div>
  );
}
