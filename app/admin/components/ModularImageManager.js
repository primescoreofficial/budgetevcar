'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  ArrowUpDown, 
  Check, 
  Star, 
  Image as ImageIcon,
  Loader2, 
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';
import { Button, Card } from './DesignSystem';
import { getImageUrl } from '@/lib/imageHelpers';
import { supabase } from '@/lib/supabase';


// Load JSZip dynamically from CDN
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve(window.JSZip);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export default function ModularImageManager({
  label,
  images = [],
  onChange,
  carName = 'Electric Vehicle',
  section = 'exterior',
  mainImagePath = '',
  onSetMainImage
}) {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Uploading / processing state
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const cancelUploadRef = useRef(false);
  const fileInputRef = useRef(null);

  // Sync state with props
  useEffect(() => {
    // Map items to have local unique IDs for sorting and client rendering
    const mapped = images.map((img, idx) => ({
      id: img.path || `saved-${idx}`,
      path: img.path,
      order: img.order || (idx + 1),
      alt: img.alt || `${carName} ${section} image`,
      size: img.size || 'N/A',
      format: img.format || 'webp',
      resolution: img.resolution || 'N/A',
      uploadDate: img.uploadDate || new Date().toLocaleDateString(),
      url: getImageUrl(img.path)
    }));
    setItems(mapped.sort((a, b) => a.order - b.order));
  }, [images, carName, section]);

  // Handle lazy loading scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 200
      ) {
        setVisibleCount(prev => Math.min(prev + 8, items.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Adaptive Compression Pipeline
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      // Do NOT process AVIF and existing WebP (upload them directly)
      if (fileExt === 'webp' || fileExt === 'avif') {
        resolve({ blob: file, format: fileExt });
        return;
      }

      // Check size & determine quality
      const sizeKB = file.size / 1024;
      let quality = 0.85; // Default

      if (sizeKB < 500) {
        // Under 500KB: No compression, just conversion
        quality = 1.0;
      } else if (sizeKB >= 500 && sizeKB < 2048) {
        // 500KB - 2MB: 90%
        quality = 0.90;
      } else if (sizeKB >= 2048 && sizeKB < 5120) {
        // 2MB - 5MB: 80%
        quality = 0.80;
      } else {
        // Above 5MB: 70%
        quality = 0.70;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve({ 
                blob, 
                format: 'webp',
                resolution: `${img.naturalWidth}x${img.naturalHeight}`,
                size: (blob.size / 1024).toFixed(1) + ' KB'
              });
            } else {
              reject(new Error('Conversion failed'));
            }
          }, 'image/webp', quality);
        };
        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  };

  // Upload handler
  const handleFiles = async (filesList) => {
    setError('');
    cancelUploadRef.current = false;
    const filesArray = Array.from(filesList);

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];
    const invalidFiles = filesArray.filter(f => !allowedTypes.includes(f.type) || f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Some files were rejected. Only JPG, PNG, WEBP, and AVIF under 10MB are allowed.');
      return;
    }

    setUploadProgress(0);
    setUploadStatus('Initializing...');

    const newUploadedItems = [];
    const total = filesArray.length;

    for (let i = 0; i < total; i++) {
      if (cancelUploadRef.current) {
        setUploadStatus('');
        setUploadProgress(0);
        return;
      }

      const file = filesArray[i];
      const percentPerFile = 100 / total;

      try {
        setUploadStatus(`Compressing ${i + 1}/${total}...`);
        setUploadProgress(Math.round(i * percentPerFile + percentPerFile * 0.2));

        const processed = await processImage(file);
        
        if (cancelUploadRef.current) return;

        setUploadStatus(`Uploading ${i + 1}/${total}...`);
        setUploadProgress(Math.round(i * percentPerFile + percentPerFile * 0.7));

        // Generate auto name: e.g. cars/tata-nexon-ev/next-id.webp
        const slug = carName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const nextNum = items.length + newUploadedItems.length + 1;
        const uploadFolder = section === 'exterior' ? 'cars' : 'car-interior';
        const storagePath = `${slug}/${nextNum}.webp`;

        const { data, error: uploadErr } = await supabase.storage
          .from(uploadFolder)
          .upload(storagePath, processed.blob, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadErr) throw uploadErr;

        // Auto Alt Text Generation
        const orientations = ['Front', 'Rear', 'Side Profile', 'Dashboard', 'Interior Cabin', 'Console', 'Wheels', 'Lights'];
        const orientationIndex = (nextNum - 1) % orientations.length;
        const autoAlt = `${carName} ${orientations[orientationIndex]}`;

        newUploadedItems.push({
          id: `${uploadFolder}/${storagePath}`,
          path: `${uploadFolder}/${storagePath}`,
          order: nextNum,
          alt: autoAlt,
          size: processed.size || ((processed.blob.size) / 1024).toFixed(1) + ' KB',
          format: processed.format,
          resolution: processed.resolution || 'N/A',
          uploadDate: new Date().toLocaleDateString()
        });

      } catch (err) {
        console.error('File process failed:', err);
        setError(`Failed to upload "${file.name}": ${err.message}`);
      }
    }

    setUploadStatus('Saving...');
    setUploadProgress(100);

    const merged = [...items, ...newUploadedItems].map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setItems(merged);
    onChange(merged.map(({ path, order, alt, size, format, resolution, uploadDate }) => ({
      path, order, alt, size, format, resolution, uploadDate
    })));

    setUploadStatus('');
    setUploadProgress(0);
  };

  // Reorder Handler using basic manual buttons for absolute bulletproof consistency
  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Re-assign orders
    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    setItems(updated);
    onChange(updated.map(({ path, order, alt, size, format, resolution, uploadDate }) => ({
      path, order, alt, size, format, resolution, uploadDate
    })));
  };

  // HTML5 Drag & Drop reordering support
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const copyListItems = [...items];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;

    const updated = copyListItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    setItems(updated);
    onChange(updated.map(({ path, order, alt, size, format, resolution, uploadDate }) => ({
      path, order, alt, size, format, resolution, uploadDate
    })));
  };

  // Delete handlers
  const handleDelete = async (idToDelete) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const filtered = items.filter(item => item.id !== idToDelete);
    const updated = filtered.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    // Optionally delete from storage in background
    try {
      const bucket = section === 'exterior' ? 'cars' : 'car-interior';
      const storageKey = idToDelete.replace(/^(cars|car-interior)\//, '');
      await supabase.storage.from(bucket).remove([storageKey]);
    } catch (e) {
      console.warn('Storage deletion failed:', e);
    }

    setItems(updated);
    onChange(updated.map(({ path, order, alt, size, format, resolution, uploadDate }) => ({
      path, order, alt, size, format, resolution, uploadDate
    })));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete all ${selectedIds.size} selected images?`)) return;

    const filtered = items.filter(item => !selectedIds.has(item.id));
    const updated = filtered.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    // Delete selected from storage in background
    const keysToDelete = Array.from(selectedIds).map(id => id.replace(/^(cars|car-interior)\//, ''));
    try {
      const bucket = section === 'exterior' ? 'cars' : 'car-interior';
      await supabase.storage.from(bucket).remove(keysToDelete);
    } catch (e) {
      console.warn('Storage deletion failed:', e);
    }

    setItems(updated);
    setSelectedIds(new Set());
    onChange(updated.map(({ path, order, alt, size, format, resolution, uploadDate }) => ({
      path, order, alt, size, format, resolution, uploadDate
    })));
  };

  // Bulk Download as ZIP
  const handleDownloadZip = async () => {
    try {
      setUploadStatus('Building ZIP...');
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = await fetch(item.url);
        const blob = await res.blob();
        zip.file(`${item.order}.webp`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${carName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${section}-images.zip`;
      link.click();
    } catch (err) {
      setError(`ZIP generation failed: ${err.message}`);
    } finally {
      setUploadStatus('');
    }
  };

  // Checkbox toggle helpers
  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  return (
    <Card className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{label}</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Total Uploaded: {items.length}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {items.length > 0 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="small"
                icon={Download}
                onClick={handleDownloadZip}
              >
                Download ZIP
              </Button>

              {selectedIds.size > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  className="text-red-650 hover:bg-red-50 hover:border-red-200"
                  icon={Trash2}
                  onClick={handleDeleteSelected}
                >
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
            </>
          )}

          <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-xs font-bold px-3 py-2 rounded-full transition h-9 shadow-sm select-none">
            <Upload className="w-4 h-4" /> Upload
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/avif"
            />
          </label>
        </div>
      </div>

      {/* Drag Progress indicator */}
      {uploadStatus && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-blue-800 font-extrabold uppercase">
            <span>{uploadStatus}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden flex items-center">
            <div 
              className="bg-[#1e40af] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="small"
              className="text-slate-500 hover:text-slate-800 py-1"
              icon={X}
              onClick={() => {
                cancelUploadRef.current = true;
                setUploadStatus('');
                setUploadProgress(0);
              }}
            >
              Cancel Upload
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* Grid Previews Area */}
      {items.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50/80 transition rounded-3xl py-12 px-6 flex flex-col items-center justify-center gap-3 cursor-pointer text-center group"
        >
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-200">
            <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Drag & Drop Images here</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Accepts JPG, PNG, WEBP, AVIF up to 10MB each</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Select All */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-slate-300 text-[#1e40af] focus:ring-[#1e40af] cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-500 cursor-pointer select-none" onClick={toggleSelectAll}>
              Select All Images
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.slice(0, visibleCount).map((item, index) => {
              const isMain = mainImagePath === item.path;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  className="relative group border border-slate-200 hover:border-blue-400 bg-white rounded-2xl p-2.5 shadow-sm transition flex flex-col justify-between"
                >
                  
                  {/* Select Checkbox & Action Icons */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-slate-300 text-[#1e40af] focus:ring-[#1e40af] cursor-pointer shadow-sm"
                    />
                  </div>

                  {/* Drag Handle Tag */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 bg-white/90 backdrop-blur-sm rounded-md border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative aspect-[3/2] rounded-xl bg-slate-50 overflow-hidden border border-slate-100 mb-3 flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                    
                    {isMain && (
                      <span className="absolute bottom-2 left-2 bg-[#1e40af] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-white" /> Main Image
                      </span>
                    )}
                  </div>

                  {/* Info Blocks */}
                  <div className="space-y-1 px-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">#{item.order}</span>
                      <span className="truncate max-w-[100px]" title={item.alt}>{item.alt}</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                      <span>{item.resolution}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2.5 gap-1.5">
                    {section === 'exterior' && !isMain && (
                      <button
                        type="button"
                        onClick={() => onSetMainImage(item.path)}
                        className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold text-slate-500 hover:text-[#1e40af] border border-slate-200 hover:border-blue-200 rounded-lg hover:bg-blue-50/30 transition cursor-pointer"
                      >
                        <Star className="w-3 h-3" /> Make Main
                      </button>
                    )}

                    <div className="flex gap-1 ms-auto">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 border border-slate-200 disabled:opacity-30 rounded cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 border border-slate-200 disabled:opacity-30 rounded cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 border border-slate-200 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Lazy Load Button */}
          {items.length > visibleCount && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setVisibleCount(prev => Math.min(prev + 8, items.length))}
              >
                Load More Images
              </Button>
            </div>
          )}

        </div>
      )}

    </Card>
  );
}
