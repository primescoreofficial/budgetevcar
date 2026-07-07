'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Button, Input, TextArea } from '@/app/admin/components/DesignSystem';

export default function WebsiteSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    website_name: 'Budget EV',
    logo: '',
    favicon: '',
    footer: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    google_analytics: ''
  });

  // Fetch settings from database (ID = 'default')
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('website_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        // If table doesn't exist or is empty, we will ignore error and save on submit
        if (data) {
          const social = data.social_links || {};
          const seo = data.seo_defaults || {};

          setSettings({
            website_name: data.website_name || 'Budget EV',
            logo: data.logo || '',
            favicon: data.favicon || '',
            footer: data.footer || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            address: data.address || '',
            facebook_url: social.facebook || '',
            twitter_url: social.twitter || '',
            instagram_url: social.instagram || '',
            linkedin_url: social.linkedin || '',
            seo_title: seo.title || '',
            seo_description: seo.description || '',
            seo_keywords: seo.keywords || '',
            google_analytics: data.google_analytics || ''
          });
        }
      } catch (err) {
        console.warn('Failed to load settings from Supabase:', err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Upload handler for Logo/Favicon buckets
  const handleUpload = async (e, field, bucket) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload directly to specified bucket ('logos' or 'favicons')
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message + `. Please ensure a public "${bucket}" bucket exists in Supabase Storage.`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setSettings(prev => ({
        ...prev,
        [field]: publicUrl
      }));
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: 'default',
        website_name: settings.website_name.trim(),
        logo: settings.logo || null,
        favicon: settings.favicon || null,
        footer: settings.footer.trim() || null,
        contact_email: settings.contact_email.trim() || null,
        contact_phone: settings.contact_phone.trim() || null,
        address: settings.address.trim() || null,
        social_links: {
          facebook: settings.facebook_url.trim(),
          twitter: settings.twitter_url.trim(),
          instagram: settings.instagram_url.trim(),
          linkedin: settings.linkedin_url.trim()
        },
        seo_defaults: {
          title: settings.seo_title.trim(),
          description: settings.seo_description.trim(),
          keywords: settings.seo_keywords.trim()
        },
        google_analytics: settings.google_analytics.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('website_settings')
        .upsert(payload);

      if (upsertError) throw upsertError;

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
          action: 'Settings Updated',
          details: 'Updated global website settings'
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      setSuccess('Website settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save website settings');
    } finally {
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader 
        title="Website Settings" 
        description="Configure branding, contact details, social links, SEO defaults and tracking scripts."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Identity & Assets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Site Identity</h2>
              
              <Input
                label="Website Name"
                name="website_name"
                value={settings.website_name}
                onChange={handleChange}
                placeholder="BudgetEV"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  name="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  placeholder="info@budgetevcar.com"
                />
                <Input
                  label="Contact Phone"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              <TextArea
                label="Office Address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="123 EV Street, Tech Park, Bangalore, India"
                className="h-16"
              />

              <Input
                label="Copyright Footer text"
                name="footer"
                value={settings.footer}
                onChange={handleChange}
                placeholder="© 2026 BudgetEV. All rights reserved."
              />
            </Card>

            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Social Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Facebook URL"
                  name="facebook_url"
                  value={settings.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="Twitter / X URL"
                  name="twitter_url"
                  value={settings.twitter_url}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                />
                <Input
                  label="Instagram URL"
                  name="instagram_url"
                  value={settings.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="LinkedIn URL"
                  name="linkedin_url"
                  value={settings.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Google Analytics</h2>
              <Input
                label="Google Analytics Measurement ID"
                name="google_analytics"
                value={settings.google_analytics}
                onChange={handleChange}
                placeholder="G-XXXXXXXXXX"
              />
            </Card>
          </div>

          {/* Right Column: Asset Upload & SEO */}
          <div className="space-y-6">
            
            {/* Logo Manager */}
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Logo Asset</h2>
              <div className="space-y-2">
                <Input
                  name="logo"
                  value={settings.logo}
                  onChange={handleChange}
                  placeholder="Logo URL"
                />
                <label className="w-full cursor-pointer inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition border border-slate-200">
                  <Upload className="w-4 h-4" /> Upload Logo
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'logo', 'logos')}
                    className="hidden" 
                  />
                </label>
                {settings.logo && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img src={settings.logo} alt="Logo" className="max-h-12 object-contain mx-auto" />
                  </div>
                )}
              </div>
            </Card>

            {/* Favicon Manager */}
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Favicon Asset</h2>
              <div className="space-y-2">
                <Input
                  name="favicon"
                  value={settings.favicon}
                  onChange={handleChange}
                  placeholder="Favicon URL"
                />
                <label className="w-full cursor-pointer inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition border border-slate-200">
                  <Upload className="w-4 h-4" /> Upload Favicon
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'favicon', 'favicons')}
                    className="hidden" 
                  />
                </label>
                {settings.favicon && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain mx-auto" />
                  </div>
                )}
              </div>
            </Card>

            {/* SEO Defaults */}
            <Card className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Default SEO</h2>
              
              <Input
                label="Fallback SEO Title"
                name="seo_title"
                value={settings.seo_title}
                onChange={handleChange}
                placeholder="BudgetEV - Find your next electric car"
              />

              <TextArea
                label="Fallback SEO Description"
                name="seo_description"
                value={settings.seo_description}
                onChange={handleChange}
                placeholder="Describe BudgetEV..."
                className="h-20"
              />

              <Input
                label="Keywords (Comma separated)"
                name="seo_keywords"
                value={settings.seo_keywords}
                onChange={handleChange}
                placeholder="ev, cars, savings, emi"
              />
            </Card>

            {/* Save Buttons */}
            <Card className="p-4 space-y-2">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="large"
                className="w-full"
                icon={Save}
              >
                {loading ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </Card>

          </div>
        </div>

      </form>
    </div>
  );
}
