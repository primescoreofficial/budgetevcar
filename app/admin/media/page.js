'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FolderHeart, 
  Upload, 
  Trash2, 
  Copy, 
  Eye, 
  Search, 
  Loader2, 
  AlertCircle, 
  Check, 
  FileText
} from 'lucide-react';
import { PageHeader, Card, Button, Input, Select } from '@/app/admin/components/DesignSystem';

const BUCKETS = [
  { id: 'cars', label: 'Cars Bucket' },
  { id: 'blogs', label: 'Blogs Bucket' },
  { id: 'news', label: 'News Bucket' },
  { id: 'logos', label: 'Logos Bucket' },
  { id: 'favicons', label: 'Favicons Bucket' },
  { id: 'media', label: 'General Media Bucket' }
];

export default function MediaLibrary() {
  const [selectedBucket, setSelectedBucket] = useState('media');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Fetch files in bucket
  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: storageError } = await supabase.storage
        .from(selectedBucket)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) throw storageError;
      setFiles(data || []);
    } catch (err) {
      setError(`Failed to list files in "${selectedBucket}": ${err.message}. Make sure this bucket is created in your Supabase dashboard and marked as public.`);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket]);

  // Upload handler
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(selectedBucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Refresh list
      fetchFiles();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete file handler
  const handleDelete = async (fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    setError('');
    try {
      const { error: removeError } = await supabase.storage
        .from(selectedBucket)
        .remove([fileName]);

      if (removeError) throw removeError;

      setFiles(files.filter(f => f.name !== fileName));
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    }
  };

  // Copy URL helper
  const handleCopyLink = (fileName) => {
    const { data: { publicUrl } } = supabase.storage
      .from(selectedBucket)
      .getPublicUrl(fileName);

    navigator.clipboard.writeText(publicUrl);
    setCopiedId(fileName);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Get Public Url helper
  const getPublicUrl = (fileName) => {
    return supabase.storage.from(selectedBucket).getPublicUrl(fileName).data.publicUrl;
  };

  // Filtered files
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) && 
    f.name !== '.emptyFolderPlaceholder'
  );

  const isImage = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="Media Library" 
        description="Browse, upload, preview and delete assets directly from Supabase Storage buckets."
      />

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Bucket Selector */}
        <Select
          value={selectedBucket}
          onChange={(e) => setSelectedBucket(e.target.value)}
        >
          {BUCKETS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </Select>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search assets by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {/* Upload Trigger Button */}
        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2.5 rounded-full h-10 transition select-none shadow-sm">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload Asset
            </>
          )}
          <input 
            type="file" 
            onChange={handleUpload}
            disabled={uploading}
            className="hidden" 
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-semibold leading-relaxed">{error}</span>
        </div>
      )}

      {/* Grid Assets View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Reading storage bucket contents...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-24 text-slate-500 text-sm bg-white border border-slate-200 rounded-2xl shadow-sm font-medium">
          No assets found in bucket &ldquo;{selectedBucket}&rdquo;. Upload files to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {filteredFiles.map((file) => {
            const fileUrl = getPublicUrl(file.name);
            const nameTruncated = file.name.length > 20 ? `${file.name.slice(0, 10)}...${file.name.slice(-8)}` : file.name;
            
            return (
              <Card key={file.id} className="p-3 flex flex-col justify-between group overflow-hidden border border-slate-200 shadow-sm">
                
                {/* Preview Frame */}
                <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-3">
                  {isImage(file.name) ? (
                    <img 
                      src={fileUrl} 
                      alt={file.name} 
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-350" />
                  )}

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-white text-slate-700 hover:bg-slate-100 rounded-full shadow-md transition">
                      <Eye className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleCopyLink(file.name)} 
                      className="p-2 bg-white text-slate-700 hover:bg-slate-100 rounded-full shadow-md transition cursor-pointer"
                    >
                      {copiedId === file.name ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(file.name)} 
                      className="p-2 bg-white text-red-650 hover:bg-red-50 rounded-full shadow-md transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                    {nameTruncated}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {(file.metadata?.size / 1024).toFixed(1)} KB
                  </p>
                </div>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
