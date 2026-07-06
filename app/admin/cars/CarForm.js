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
  AlertCircle,
  FileText,
  Trash2
} from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, TextArea, Badge } from '@/app/admin/components/DesignSystem';

export default function CarForm({ carId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!carId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model_name: '',
    variant_name: '',
    detailed_name: '',
    slug: '',
    body_type: '',
    battery_capacity: '',
    claimed_range: '',
    real_range: '',
    motor: '',
    torque: '',
    power: '',
    drive_type: '',
    charging: '',
    ac_charging: '',
    dc_charging: '',
    charging_time: '',
    top_speed: '',
    acceleration: '',
    ground_clearance: '',
    wheelbase: '',
    boot_space: '',
    tyres: '',
    safety: '',
    warranty: '',
    brochure: '',
    seo_title: '',
    seo_description: '',
    status: 'draft',
    segment: '',
    features: [],
    pros: [],
    cons: [],
    colors: [],
    meta_keywords: [],
    interior_images: [],
    exterior_images: [],
    gallery_images: [],
    vehicle_image: '',
  });

  // Array input states
  const [newFeature, setNewFeature] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // Fetch existing car details
  useEffect(() => {
    if (!carId) return;
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
              if (['features', 'pros', 'cons', 'colors', 'meta_keywords', 'interior_images', 'exterior_images', 'gallery_images'].includes(key)) {
                normalized[key] = [];
              } else {
                normalized[key] = '';
              }
            }
          });
          setFormData(normalized);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle specifications');
      } finally {
        setFetching(false);
      }
    };
    fetchCarDetails();
  }, [carId]);

  // Handle standard field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'brand' || name === 'model_name' || name === 'variant_name') {
        const brand = name === 'brand' ? value : prev.brand;
        const model = name === 'model_name' ? value : prev.model_name;
        const variant = name === 'variant_name' ? value : prev.variant_name;
        next.detailed_name = `${brand} ${model} ${variant}`.trim().replace(/\s+/g, ' ');
        next.slug = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return next;
    });
  };

  // Add item helper
  const handleAddListItem = (field, value, setValue) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setValue('');
  };

  // Remove item helper
  const handleRemoveListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index)
    }));
  };

  // Upload handler
  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedFile = await compressImage(file);
    setLoading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `cars/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw new Error(uploadError.message + '. Please ensure a public "media" bucket exists in Supabase Storage.');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (['interior_images', 'exterior_images', 'gallery_images'].includes(field)) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], publicUrl]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: publicUrl
        }));
      }
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.85);
        };
      };
    });
  };

  // Submit Specifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.brand.trim() || !formData.model_name.trim()) {
        throw new Error('Brand and Model Name are required.');
      }

      let serialNo = formData.serial_no;
      if (!carId) {
        const { data: maxCar, error: maxError } = await supabase
          .from('cars')
          .select('serial_no')
          .order('serial_no', { ascending: false })
          .limit(1);
        
        serialNo = maxCar && maxCar[0] ? (maxCar[0].serial_no || 0) + 1 : 1;
      }

      const submissionPayload = {
        ...formData,
        serial_no: serialNo,
        vehicle_image: formData.vehicle_image || null,
        brochure: formData.brochure || null,
      };

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

      setSuccess('Vehicle specs saved successfully!');
      setTimeout(() => {
        router.push('/admin/cars');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save specifications');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  const backAction = (
    <Button 
      variant="secondary" 
      size="medium" 
      icon={ArrowLeft}
      onClick={() => router.push('/admin/cars')}
    >
      Back
    </Button>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader 
        title={carId ? 'Edit Vehicle Specifications' : 'Add New EV'} 
        description="Fill out specifications, technical metrics, media files, and SEO configs."
        action={backAction}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left Column - 2 Columns wide on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: General Information */}
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Brand *"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Tata Motors"
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
                label="Slug (URL)"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. tata-nexon-ev"
              />
              <Input
                label="Body Type"
                name="body_type"
                value={formData.body_type}
                onChange={handleChange}
                placeholder="e.g. SUV"
              />
              <Input
                label="Segment"
                name="segment"
                value={formData.segment}
                onChange={handleChange}
                placeholder="e.g. Mid-size SUV"
              />
            </div>
            
            <Input
              label="Detailed Display Name"
              name="detailed_name"
              value={formData.detailed_name}
              onChange={handleChange}
              placeholder="Tata Nexon EV Empowered Plus"
            />
          </Card>

          {/* Card 2: Specifications */}
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">Technical Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Battery Capacity (kWh)"
                name="battery_capacity"
                value={formData.battery_capacity}
                onChange={handleChange}
                placeholder="e.g. 40.5"
              />
              <Input
                label="Claimed Range (km)"
                name="claimed_range"
                value={formData.claimed_range}
                onChange={handleChange}
                placeholder="e.g. 465"
              />
              <Input
                label="Real Range (km)"
                name="real_range"
                value={formData.real_range}
                onChange={handleChange}
                placeholder="e.g. 340"
              />
              <Input
                label="Motor Type"
                name="motor"
                value={formData.motor}
                onChange={handleChange}
                placeholder="e.g. PMSM"
              />
              <Input
                label="Torque (Nm)"
                name="torque"
                value={formData.torque}
                onChange={handleChange}
                placeholder="e.g. 215 Nm"
              />
              <Input
                label="Power (PS)"
                name="power"
                value={formData.power}
                onChange={handleChange}
                placeholder="e.g. 143 PS"
              />
              <Input
                label="Drive Type"
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                placeholder="e.g. FWD"
              />
              <Input
                label="Top Speed (km/h)"
                name="top_speed"
                value={formData.top_speed}
                onChange={handleChange}
                placeholder="e.g. 150"
              />
              <Input
                label="0-100 Acceleration (s)"
                name="acceleration"
                value={formData.acceleration}
                onChange={handleChange}
                placeholder="e.g. 8.9"
              />
            </div>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Chassis & Practicality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Ground Clearance (mm)"
                name="ground_clearance"
                value={formData.ground_clearance}
                onChange={handleChange}
                placeholder="e.g. 190 mm"
              />
              <Input
                label="Wheelbase (mm)"
                name="wheelbase"
                value={formData.wheelbase}
                onChange={handleChange}
                placeholder="e.g. 2498 mm"
              />
              <Input
                label="Boot Space (L)"
                name="boot_space"
                value={formData.boot_space}
                onChange={handleChange}
                placeholder="e.g. 350 L"
              />
              <Input
                label="Tyres Size"
                name="tyres"
                value={formData.tyres}
                onChange={handleChange}
                placeholder="e.g. 215/60 R16"
              />
            </div>
          </Card>

          {/* Card 3: Charging Information */}
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">Charging Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Charging Standard"
                name="charging"
                value={formData.charging}
                onChange={handleChange}
                placeholder="e.g. CCS Type 2"
              />
              <Input
                label="AC Charging Specs"
                name="ac_charging"
                value={formData.ac_charging}
                onChange={handleChange}
                placeholder="e.g. 7.2 kW AC"
              />
              <Input
                label="DC Fast Charging Specs"
                name="dc_charging"
                value={formData.dc_charging}
                onChange={handleChange}
                placeholder="e.g. 50 kW DC"
              />
              <Input
                label="Charging Time duration"
                name="charging_time"
                value={formData.charging_time}
                onChange={handleChange}
                placeholder="e.g. 10-80% in 56 min"
              />
            </div>
          </Card>

          {/* Card 4: Image Media Manager */}
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">Images & Assets</h2>
            
            {/* Main vehicle image upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Main Vehicle Image</label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Input
                  name="vehicle_image"
                  value={formData.vehicle_image}
                  onChange={handleChange}
                  placeholder="https://supabase-storage-url.com/image.png"
                />
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl h-10 transition shrink-0 select-none">
                  <Upload className="w-4.5 h-4.5" /> Upload File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'vehicle_image')}
                    className="hidden" 
                  />
                </label>
              </div>
              
              {formData.vehicle_image && (
                <div className="relative w-40 aspect-video rounded-xl border border-slate-800 bg-slate-950/40 p-2 overflow-hidden group">
                  <img src={formData.vehicle_image} alt="Vehicle Main" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, vehicle_image: '' }))}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery folders */}
            {[
              { label: 'Interior Images', field: 'interior_images' },
              { label: 'Exterior Images', field: 'exterior_images' },
              { label: 'Gallery Images', field: 'gallery_images' }
            ].map(gallery => (
              <div key={gallery.field} className="space-y-3 pt-4 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{gallery.label}</label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-750 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition select-none">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, gallery.field)}
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {formData[gallery.field].map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg border border-slate-850 bg-slate-950/30 overflow-hidden group p-1">
                      <img src={url} alt="Gallery item" className="w-full h-full object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => handleRemoveListItem(gallery.field, idx)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-sm"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Side Panel (Right Column - 1 Column wide) */}
        <div className="space-y-8">
          
          {/* Card 5: Publishing & Actions */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">Publishing</h2>
            
            <Select
              label="Publication Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft" className="bg-slate-950">Draft</option>
              <option value="published" className="bg-slate-950">Published</option>
            </Select>

            <Input
              label="Safety Rating"
              name="safety"
              value={formData.safety}
              onChange={handleChange}
              placeholder="e.g. 5 Star (Bharat NCAP)"
            />

            <Input
              label="Warranty Summary"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              placeholder="e.g. 8 Years / 1,600,000 km"
            />

            <Input
              label="Brochure Document URL"
              name="brochure"
              value={formData.brochure}
              onChange={handleChange}
              placeholder="https://supabase.co/pdf-link.pdf"
            />

            <div className="pt-2 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="large"
                className="w-full"
                icon={Save}
              >
                {loading ? 'Saving specs...' : 'Save Specifications'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                className="w-full"
                onClick={() => router.push('/admin/cars')}
              >
                Cancel
              </Button>
            </div>
          </Card>

          {/* Card 6: Lists & Practicality */}
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">Pros & Cons lists</h2>
            
            {/* Pros/Cons/Features/Colors */}
            {[
              { label: 'Features List', state: newFeature, setState: setNewFeature, field: 'features', placeholder: 'e.g. ADAS Level 2' },
              { label: 'Pros', state: newPro, setState: setNewPro, field: 'pros', placeholder: 'e.g. Quiet Cabin' },
              { label: 'Cons', state: newCon, setState: setNewCon, field: 'cons', placeholder: 'e.g. High Starting Price' },
              { label: 'Available Colors', state: newColor, setState: setNewColor, field: 'colors', placeholder: 'e.g. Nebula Blue' }
            ].map(list => (
              <div key={list.field} className="space-y-2 border-b border-slate-950 pb-3 last:border-0 last:pb-0">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{list.label}</label>
                <div className="flex gap-2">
                  <Input
                    value={list.state}
                    onChange={(e) => list.setState(e.target.value)}
                    placeholder={list.placeholder}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3"
                    onClick={() => handleAddListItem(list.field, list.state, list.setState)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-36 overflow-y-auto custom-scrollbar">
                  {formData[list.field].map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-950 border border-slate-900 text-xs text-slate-300 rounded-full font-medium">
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveListItem(list.field, idx)}
                        className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Card 7: SEO Configuration */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-900 pb-3 tracking-tight">SEO Parameters</h2>
            
            <Input
              label="SEO Title"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              placeholder="Title for search engines..."
            />

            <TextArea
              label="SEO Meta Description"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              placeholder="Short description under 160 characters..."
            />

            {/* SEO Keywords */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">SEO Keywords</label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. budget, nexon, specs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3"
                  onClick={() => handleAddListItem('meta_keywords', newKeyword, setNewKeyword)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.meta_keywords.map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-950 border border-slate-900 text-xs text-slate-350 rounded-full font-medium">
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem('meta_keywords', idx)}
                      className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </form>
    </div>
  );
}
