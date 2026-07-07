'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ArrowRight,
  Save, 
  Loader2, 
  X, 
  AlertCircle,
  CheckCircle2,
  Crop,
  Star,
  Sparkles,
  Search,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, TextArea } from '@/app/admin/components/DesignSystem';
import CustomCropper from '../components/CustomCropper';
import ModularImageManager from '../components/ModularImageManager';
import { getImageUrl } from '@/lib/imageHelpers';

const FORM_STEPS = [
  { step: 1, label: 'Basic Information' },
  { step: 2, label: 'Images' },
  { step: 3, label: 'Specifications' },
  { step: 4, label: 'SEO Config' },
  { step: 5, label: 'Publish & Preview' }
];

export default function CarForm({ carId = null }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!carId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model_name: '',
    variant_name: '',
    detailed_name: '',
    slug: '',
    body_type: '',
    battery_capacity: '',
    segment: '',
    web_search_summary: '',
    vehicle_image: '',
    vehicle_thumbnail: '',
    seo_title: '',
    seo_description: '',
    status: 'draft'
  });

  const [exteriorImages, setExteriorImages] = useState([]);
  const [interiorImages, setInteriorImages] = useState([]);

  // Cropper state
  const [cropperSrc, setCropperSrc] = useState(null);

  // Autosave status
  const [autosaveMsg, setAutosaveMsg] = useState('');

  // 1. Fetch vehicle details
  useEffect(() => {
    if (!carId) {
      // Check if there is an autosaved draft to restore
      const saved = localStorage.getItem('budgetev-draft-car-new');
      if (saved) {
        try {
          const { data, ext, int } = JSON.parse(saved);
          setFormData(data);
          setExteriorImages(ext || []);
          setInteriorImages(int || []);
          setAutosaveMsg('Draft restored from local backup.');
          setTimeout(() => setAutosaveMsg(''), 4000);
        } catch (e) {
          console.warn('Failed to load backup:', e);
        }
      }
      return;
    }

    const fetchCarDetails = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', carId)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          const normalized = { ...data };
          Object.keys(normalized).forEach(key => {
            if (normalized[key] === null) {
              normalized[key] = '';
            }
          });
          
          setFormData({
            brand: normalized.brand || '',
            model_name: normalized.model_name || '',
            variant_name: normalized.variant_name || '',
            detailed_name: normalized.detailed_name || '',
            slug: normalized.slug || '',
            body_type: normalized.body_type || '',
            battery_capacity: normalized.battery_capacity || '',
            segment: normalized.segment || '',
            web_search_summary: normalized.web_search_summary || '',
            vehicle_image: normalized.vehicle_image || '',
            vehicle_thumbnail: normalized.vehicle_thumbnail || '',
            seo_title: normalized.seo_title || '',
            seo_description: normalized.seo_description || '',
            status: normalized.status || 'draft'
          });

          setExteriorImages(normalized.exterior_images || []);
          setInteriorImages(normalized.interior_images || []);

          // Check if local backup is newer
          const backup = localStorage.getItem(`budgetev-draft-car-${carId}`);
          if (backup) {
            setAutosaveMsg('A newer unsaved local backup is available.');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle specifications');
      } finally {
        setFetching(false);
      }
    };
    fetchCarDetails();
  }, [carId]);

  // 2. Autosave Hook (runs every 30 seconds if form is dirty)
  useEffect(() => {
    if (!isDirty) return;
    const interval = setInterval(() => {
      const key = carId ? `budgetev-draft-car-${carId}` : 'budgetev-draft-car-new';
      localStorage.setItem(key, JSON.stringify({
        data: formData,
        ext: exteriorImages,
        int: interiorImages,
        timestamp: Date.now()
      }));
      setAutosaveMsg('Draft saved locally...');
      setTimeout(() => setAutosaveMsg(''), 2000);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, exteriorImages, interiorImages, isDirty, carId]);

  // 3. Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Restore local draft trigger
  const restoreBackup = () => {
    const key = carId ? `budgetev-draft-car-${carId}` : 'budgetev-draft-car-new';
    const backup = localStorage.getItem(key);
    if (backup) {
      try {
        const { data, ext, int } = JSON.parse(backup);
        setFormData(data);
        setExteriorImages(ext || []);
        setInteriorImages(int || []);
        setAutosaveMsg('Backup successfully restored.');
        setIsDirty(true);
        setTimeout(() => setAutosaveMsg(''), 3000);
      } catch (e) {
        setError('Failed to restore backup');
      }
    }
  };

  const discardBackup = () => {
    const key = carId ? `budgetev-draft-car-${carId}` : 'budgetev-draft-car-new';
    localStorage.removeItem(key);
    setAutosaveMsg('');
  };

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Auto-generate detailed name and slug
      if (name === 'brand' || name === 'model_name' || name === 'variant_name') {
        const brand = name === 'brand' ? value : prev.brand;
        const model = name === 'model_name' ? value : prev.model_name;
        const variant = name === 'variant_name' ? value : prev.variant_name;
        
        next.detailed_name = `${brand} ${model} ${variant}`.trim().replace(/\s+/g, ' ');
        next.slug = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        // Auto SEO tag generation
        next.seo_title = `All New ${next.detailed_name} Range, Price, Specs & Reviews`;
        next.seo_description = `Read expert reviews, real-world battery mileage, cost savings, charging speed, and detailed variant specifications for the new ${next.detailed_name} in India.`;
      }
      return next;
    });
  };

  // Main Image Set Handler (from uploaded list)
  const handleSetMainImage = (imagePath) => {
    setIsDirty(true);
    // Open cropper to generate thumbnail.webp at 600x400
    setCropperSrc(getImageUrl(imagePath));
    setFormData(prev => ({
      ...prev,
      vehicle_image: imagePath
    }));
  };

  // Apply Crop handler
  const handleCropComplete = async (croppedBlob) => {
    setCropperSrc(null);
    setLoading(true);
    setError('');

    try {
      const slug = formData.slug || 'car';
      const storagePath = `${slug}/thumbnail.webp`;

      // Upload cropped thumbnail
      const { data, error: uploadErr } = await supabase.storage
        .from('cars')
        .upload(storagePath, croppedBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadErr) throw uploadErr;

      setFormData(prev => ({
        ...prev,
        vehicle_thumbnail: `cars/${storagePath}`
      }));
      setSuccess('Main vehicle thumbnail cropped successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to save cropped thumbnail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Main Submit (includes Sequential Object Renaming)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.brand.trim() || !formData.model_name.trim()) {
        throw new Error('Brand and Model Name are required in Step 1.');
      }

      const slug = formData.slug;

      // Sequential renaming of files in storage based on sorting order
      // 1. Exterior
      setAutosaveMsg('Renaming exterior images...');
      const finalExterior = [];
      for (let i = 0; i < exteriorImages.length; i++) {
        const img = exteriorImages[i];
        const expectedPath = `cars/${slug}/${i + 1}.webp`;
        if (img.path !== expectedPath) {
          try {
            const tempPath = `cars/${slug}/temp_${i + 1}.webp`;
            const oldKey = img.path.replace(/^cars\//, '');
            const tempKey = tempPath.replace(/^cars\//, '');
            await supabase.storage.from('cars').move(oldKey, tempKey);
            img.path = tempPath;
          } catch (moveErr) {
            console.warn('Exterior temporary move failed or skipped:', moveErr.message);
          }
        }
      }
      for (let i = 0; i < exteriorImages.length; i++) {
        const img = exteriorImages[i];
        const finalPath = `cars/${slug}/${i + 1}.webp`;
        if (img.path !== finalPath) {
          try {
            const oldKey = img.path.replace(/^cars\//, '');
            const finalKey = finalPath.replace(/^cars\//, '');
            await supabase.storage.from('cars').move(oldKey, finalKey);
          } catch (moveErr) {
            console.warn('Exterior final move failed:', moveErr.message);
          }
        }
        finalExterior.push({
          path: finalPath,
          order: i + 1,
          alt: `${formData.brand} ${formData.model_name} View ${i + 1}`
        });
      }

      // 2. Interior
      setAutosaveMsg('Renaming interior images...');
      const finalInterior = [];
      for (let i = 0; i < interiorImages.length; i++) {
        const img = interiorImages[i];
        const expectedPath = `car-interior/${slug}/${i + 1}.webp`;
        if (img.path !== expectedPath) {
          try {
            const tempPath = `car-interior/${slug}/temp_${i + 1}.webp`;
            const oldKey = img.path.replace(/^car-interior\//, '');
            const tempKey = tempPath.replace(/^car-interior\//, '');
            await supabase.storage.from('car-interior').move(oldKey, tempKey);
            img.path = tempPath;
          } catch (moveErr) {
            console.warn('Interior temporary move failed or skipped:', moveErr.message);
          }
        }
      }
      for (let i = 0; i < interiorImages.length; i++) {
        const img = interiorImages[i];
        const finalPath = `car-interior/${slug}/${i + 1}.webp`;
        if (img.path !== finalPath) {
          try {
            const oldKey = img.path.replace(/^car-interior\//, '');
            const finalKey = finalPath.replace(/^car-interior\//, '');
            await supabase.storage.from('car-interior').move(oldKey, finalKey);
          } catch (moveErr) {
            console.warn('Interior final move failed:', moveErr.message);
          }
        }
        finalInterior.push({
          path: finalPath,
          order: i + 1,
          alt: `${formData.brand} ${formData.model_name} Interior ${i + 1}`
        });
      }

      // Generate next serial number if new car
      let serialNo = undefined;
      if (!carId) {
        const { data: maxCar } = await supabase
          .from('cars')
          .select('serial_no')
          .order('serial_no', { ascending: false })
          .limit(1);
        serialNo = maxCar && maxCar[0] ? (maxCar[0].serial_no || 0) + 1 : 1;
      }

      setAutosaveMsg('Saving database record...');
      const submissionPayload = {
        brand: formData.brand.trim(),
        model_name: formData.model_name.trim(),
        variant_name: formData.variant_name.trim() || null,
        detailed_name: formData.detailed_name.trim(),
        slug: formData.slug.trim(),
        body_type: formData.body_type.trim() || null,
        battery_capacity: formData.battery_capacity ? parseFloat(formData.battery_capacity) : null,
        segment: formData.segment.trim() || null,
        web_search_summary: formData.web_search_summary.trim() || null,
        vehicle_image: formData.vehicle_image || null,
        vehicle_thumbnail: formData.vehicle_thumbnail || null,
        exterior_images: finalExterior,
        interior_images: finalInterior,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        status: formData.status
      };

      if (!carId) {
        submissionPayload.serial_no = serialNo;
      }

      if (carId) {
        const { error: updateError } = await supabase
          .from('cars')
          .update(submissionPayload)
          .eq('id', carId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cars')
          .insert(submissionPayload);

        if (insertError) throw insertError;
      }

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
          action: carId ? 'Car Edited' : 'Car Added',
          details: `Saved ${formData.detailed_name} with status ${formData.status}`
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      // Remove local backups
      const key = carId ? `budgetev-draft-car-${carId}` : 'budgetev-draft-car-new';
      localStorage.removeItem(key);

      setIsDirty(false);
      setSuccess(`✅ Car saved successfully! Exterior: ${finalExterior.length}, Interior: ${finalInterior.length}`);
      
      setTimeout(() => {
        router.push('/admin/cars');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save vehicle details');
    } finally {
      setLoading(false);
      setAutosaveMsg('');
    }
  };

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-[#1e40af] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader 
        title={carId ? 'Edit EV Specification' : 'Add New EV Specification'} 
        description="Configure specifications, upload, drag-reorder images, crop thumbnails, and adjust SEO tags."
        action={
          <Button 
            variant="secondary" 
            size="medium" 
            icon={ArrowLeft}
            onClick={() => {
              if (isDirty && !confirm('Discard unsaved changes?')) return;
              router.push('/admin/cars');
            }}
          >
            Back
          </Button>
        }
      />

      {/* Backup recovery banner */}
      {autosaveMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs font-bold">{autosaveMsg}</span>
          </div>
          {autosaveMsg.includes('backup') && (
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="small" onClick={restoreBackup}>Restore</Button>
              <Button type="button" variant="ghost" size="small" onClick={discardBackup} className="text-red-650">Discard</Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <X className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{success}</span>
        </div>
      )}

      {/* Wizard Steps indicator */}
      <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {FORM_STEPS.map(item => {
          const isActive = activeStep === item.step;
          const isCompleted = activeStep > item.step;

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition cursor-pointer select-none ${
                isActive 
                  ? 'bg-blue-50 border border-blue-200 text-[#1e40af]' 
                  : isCompleted 
                    ? 'bg-emerald-50/50 border border-emerald-100 text-emerald-700' 
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">Step {item.step}</span>
              <span className="text-[11px] font-bold mt-1 text-center truncate w-full px-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Wizard Form body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active step panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* STEP 1: Basic Info */}
          {activeStep === 1 && (
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Basic Vehicle Specs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Brand *"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Tata"
                  required
                />
                <Input
                  label="Model Name *"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  placeholder="e.g. Nexon EV"
                  required
                />
                <Input
                  label="Variant Name"
                  name="variant_name"
                  value={formData.variant_name}
                  onChange={handleChange}
                  placeholder="e.g. Empowered Plus"
                />
                <Input
                  label="Body Type"
                  name="body_type"
                  value={formData.body_type}
                  onChange={handleChange}
                  placeholder="e.g. SUV, Hatchback"
                />
                <Input
                  label="Segment"
                  name="segment"
                  value={formData.segment}
                  onChange={handleChange}
                  placeholder="e.g. SUV"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <Input
                  label="Display Name (Auto-Generated)"
                  name="detailed_name"
                  value={formData.detailed_name}
                  readOnly
                  className="bg-slate-50 cursor-not-allowed text-slate-500 font-semibold"
                />
                <Input
                  label="URL Slug (Auto-Generated)"
                  name="slug"
                  value={formData.slug}
                  readOnly
                  className="bg-slate-50 cursor-not-allowed text-slate-500 font-semibold"
                />
              </div>
            </Card>
          )}

          {/* STEP 2: Images Management */}
          {activeStep === 2 && (
            <div className="space-y-6">
              
              {/* Main Thumbnail Selector Panel */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Main Vehicle Thumbnail</h3>
                  {formData.vehicle_image && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="small" 
                      icon={Crop}
                      onClick={() => setCropperSrc(getImageUrl(formData.vehicle_image))}
                    >
                      Crop Image
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Visual Frame */}
                  <div className="relative w-44 aspect-[3/2] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                    {formData.vehicle_thumbnail ? (
                      <img src={getImageUrl(formData.vehicle_thumbnail)} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    ) : formData.vehicle_image ? (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[10px] font-bold block">Need to Crop</span>
                      </div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800">Vehicle Thumbnail (600x400)</p>
                    <p className="text-[10px] text-slate-400 font-semibold max-w-sm leading-relaxed">
                      Select an image from the **Exterior Images** list below and click &ldquo;Make Main&rdquo; or click Crop to adjust.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Exterior Images */}
              <ModularImageManager
                label="Exterior Images"
                images={exteriorImages}
                onChange={setExteriorImages}
                carName={formData.detailed_name || 'Vehicle'}
                section="exterior"
                mainImagePath={formData.vehicle_image}
                onSetMainImage={handleSetMainImage}
              />

              {/* Interior Images */}
              <ModularImageManager
                label="Interior Images"
                images={interiorImages}
                onChange={setInteriorImages}
                carName={formData.detailed_name || 'Vehicle'}
                section="interior"
              />

            </div>
          )}

          {/* STEP 3: Specifications */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Technical Specs</h2>
                <Input
                  label="Battery Capacity (kWh)"
                  name="battery_capacity"
                  type="number"
                  step="0.01"
                  value={formData.battery_capacity}
                  onChange={handleChange}
                  placeholder="e.g. 40.5"
                />
              </Card>

              <Card className="space-y-4">
                <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Search & Review Summary</h2>
                <TextArea
                  label="Web Search Summary"
                  name="web_search_summary"
                  value={formData.web_search_summary}
                  onChange={handleChange}
                  placeholder="Provide a detailed summary of the vehicle specifications, battery details, range, pricing in India, and overall reviews to assist comparisons and the AI Chat agent..."
                  className="h-44"
                />
              </Card>
            </div>
          )}

          {/* STEP 4: SEO Configurations */}
          {activeStep === 4 && (
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">SEO Meta Information</h2>
              <Input
                label="SEO Meta Title"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                placeholder="Meta title used by search engines..."
              />
              <TextArea
                label="SEO Meta Description"
                name="seo_description"
                value={formData.seo_description}
                onChange={handleChange}
                placeholder="Meta description summarizing page content..."
                className="h-32"
              />
            </Card>
          )}

          {/* STEP 5: Publish & Preview */}
          {activeStep === 5 && (
            <Card className="space-y-6">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Review & Publish</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Review the vehicle specifications and images summary before launching live.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-xs font-bold text-slate-700">
                <div className="space-y-2">
                  <p><span className="text-slate-400">Brand / Name:</span> {formData.detailed_name || 'N/A'}</p>
                  <p><span className="text-slate-400">Slug:</span> /{formData.slug || 'N/A'}</p>
                  <p><span className="text-slate-400">Battery:</span> {formData.battery_capacity || 'N/A'} kWh</p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-slate-400">Exterior Images:</span> {exteriorImages.length}</p>
                  <p><span className="text-slate-400">Interior Images:</span> {interiorImages.length}</p>
                  <p><span className="text-slate-400">Thumbnail cropped:</span> {formData.vehicle_thumbnail ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>

              {formData.slug && (
                <div className="flex gap-2">
                  <a 
                    href={`/cars/${formData.slug}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold py-2 rounded-xl transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Preview Live Car Page
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* Wizard step navigation footer controls */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={handlePrev}
              disabled={activeStep === 1}
            >
              Previous Step
            </Button>

            {activeStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="medium"
                icon={ArrowRight}
                onClick={handleNext}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="medium"
                icon={Save}
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Saving...' : 'Save & Publish EV'}
              </Button>
            )}
          </div>

        </div>

        {/* Sidebar Controls (Publish status configuration) */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Status Settings</h2>
            
            <Select
              label="Publication Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>

            <div className="pt-2">
              <Button
                type="button"
                disabled={loading}
                variant="primary"
                size="large"
                className="w-full"
                icon={Save}
                onClick={handleSubmit}
              >
                {loading ? 'Saving EV...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>

      </div>

      {/* Cropper Modal overlay */}
      {cropperSrc && (
        <CustomCropper
          imageSrc={cropperSrc}
          onCrop={handleCropComplete}
          onCancel={() => setCropperSrc(null)}
        />
      )}

    </div>
  );
}
