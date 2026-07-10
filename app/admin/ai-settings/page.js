'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, AlertCircle, Plus, X, CheckCircle2, Upload, RefreshCw, Trash2, RotateCcw } from 'lucide-react';

import { PageHeader, Card, Button, Input, TextArea, Select } from '@/app/admin/components/DesignSystem';
import { getBotLogo } from '@/lib/imageHelpers';
import dynamic from 'next/dynamic';

const CustomCropper = dynamic(() => import('../components/CustomCropper'), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-xs font-semibold text-slate-500">Loading Image Editor...</div>
});

export default function AISettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI Settings State
  const [settings, setSettings] = useState({
    welcome_message: '',
    suggested_questions: [],
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 1000,
    gemini_model: 'gemini-2.5-flash',
    enabled: true,
    bot_logo_path: ''
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [cropperSrc, setCropperSrc] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [lastCroppedBlob, setLastCroppedBlob] = useState(null);

  // Fetch AI settings (ID = 'default')
  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('ai_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (data) {
          setSettings({
            welcome_message: data.welcome_message || '',
            suggested_questions: data.suggested_questions || [],
            system_prompt: data.system_prompt || '',
            temperature: data.temperature !== undefined ? parseFloat(data.temperature) : 0.7,
            max_tokens: data.max_tokens !== undefined ? parseInt(data.max_tokens, 10) : 1000,
            gemini_model: data.gemini_model || 'gemini-1.5-flash',
            enabled: data.enabled !== undefined ? data.enabled : true,
            bot_logo_path: data.bot_logo_path || ''
          });
        }
      } catch (err) {
        console.warn('Failed to load AI settings:', err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchAISettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setSettings(prev => ({ ...prev, [name]: finalVal }));
  };

  // Add/Remove suggested question helpers
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const q = newQuestion.trim();
    if (settings.suggested_questions.includes(q)) return;
    setSettings(prev => ({
      ...prev,
      suggested_questions: [...prev.suggested_questions, q]
    }));
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index) => {
    setSettings(prev => ({
      ...prev,
      suggested_questions: prev.suggested_questions.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: 'default',
        welcome_message: settings.welcome_message.trim() || null,
        suggested_questions: settings.suggested_questions,
        system_prompt: settings.system_prompt.trim() || null,
        temperature: parseFloat(settings.temperature),
        max_tokens: parseInt(settings.max_tokens, 10),
        gemini_model: settings.gemini_model.trim(),
        enabled: settings.enabled,
        bot_logo_path: settings.bot_logo_path || null,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('ai_settings')
        .upsert(payload);

      if (upsertError) throw upsertError;

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
          action: 'AI Settings Updated',
          details: 'Updated global AI configurations'
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      setSuccess('AI configurations saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format (PNG, JPG, JPEG, WebP)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Only PNG, JPG, JPEG, and WebP are allowed.');
      return;
    }

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds the 2 MB limit.');
      return;
    }

    setUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadBlob = async (blob) => {
    setLoading(true);
    setUploadError('');
    try {
      const fileName = `budgetev-ai-${Date.now()}.webp`;
      const filePath = `${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('logos')
        .upload(filePath, blob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadErr) {
        throw new Error(uploadErr.message + `. Please ensure a public "logos" bucket exists in Supabase Storage.`);
      }

      const relativePath = `logos/${filePath}`;

      setSettings(prev => ({
        ...prev,
        bot_logo_path: relativePath
      }));

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
          action: 'Updated AI Bot Logo',
          details: 'Uploaded and cropped new AI Bot logo'
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      setSuccess('AI Bot Logo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setLastCroppedBlob(null);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
      setLastCroppedBlob(blob);
    } finally {
      setLoading(false);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    setCropperSrc(null);
    uploadBlob(croppedBlob);
  };

  const handleRetryUpload = () => {
    if (lastCroppedBlob) {
      uploadBlob(lastCroppedBlob);
    }
  };

  const handleRemoveLogo = async () => {
    setSettings(prev => ({ ...prev, bot_logo_path: '' }));
    setUploadError('');
    try {
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: 'Removed AI Bot Logo',
        details: 'Removed custom AI Bot logo'
      });
    } catch (err) {
      console.warn('Logging failed:', err);
    }
    setSuccess('AI Bot Logo removed.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetLogo = async () => {
    setSettings(prev => ({ ...prev, bot_logo_path: '/logo/budgetev-ai-assistant.jpg' }));
    setUploadError('');
    try {
      await supabase.from('activity_logs').insert({
        admin_name: (await supabase.auth.getUser()).data.user?.email || 'admin',
        action: 'Reset AI Bot Logo',
        details: 'Reset AI Bot logo to default fallback'
      });
    } catch (err) {
      console.warn('Logging failed:', err);
    }
    setSuccess('AI Bot Logo reset to default.');
    setTimeout(() => setSuccess(''), 3000);
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
        title="AI Assistant Settings" 
        description="Configure parameters, system prompt instructions, and suggested questions for the AI bot."
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Prompts & Instructions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">System Prompt & Context</h2>
            
            <TextArea
              label="System Prompt"
              name="system_prompt"
              value={settings.system_prompt}
              onChange={handleChange}
              placeholder="Provide context and rules for the AI assistant here..."
              className="h-72 font-mono text-sm leading-relaxed"
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Suggested Questions</h2>
            
            <div className="flex gap-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. Which electric car has the best range under 15 Lakh?"
              />
              <Button
                type="button"
                variant="secondary"
                className="px-3"
                onClick={handleAddQuestion}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto custom-scrollbar">
              {settings.suggested_questions.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No suggested questions added.</p>
              ) : (
                settings.suggested_questions.map((q, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold group">
                    <span>{q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Model Parameters */}
        <div className="space-y-6">
          {/* Logo Manager */}
          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">AI Bot Logo</h2>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl space-y-2">
                <p className="text-xs font-semibold">{uploadError}</p>
                {lastCroppedBlob && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="small" 
                    onClick={handleRetryUpload}
                    icon={RefreshCw}
                    className="w-full text-xs"
                  >
                    Retry Upload
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                <img 
                  src={getBotLogo(settings.bot_logo_path)} 
                  alt="AI Bot Logo Preview" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                />
              </div>

              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500">
                    <Upload className="w-4 h-4" /> 
                    {settings.bot_logo_path ? 'Replace' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="sr-only" 
                      aria-label="Upload AI Bot Logo"
                    />
                  </label>

                  {settings.bot_logo_path && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRemoveLogo}
                      className="px-3"
                      aria-label="Remove Custom AI Bot Logo"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  {settings.bot_logo_path && settings.bot_logo_path !== '/logo/budgetev-ai-assistant.jpg' && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetLogo}
                      className="px-3"
                      aria-label="Reset AI Bot Logo to Default"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium text-center">
                  Only PNG, JPG, JPEG, or WebP. Max 2 MB. Fixed square crop.
                </p>

                <div className="border-t border-slate-100 pt-3 space-y-2 w-full">
                  <Input
                    label="Or Paste Image Link"
                    name="bot_logo_path"
                    value={(settings.bot_logo_path || '').startsWith('logos/') ? '' : settings.bot_logo_path}
                    onChange={handleChange}
                    placeholder="e.g. https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>


            {/* Live Preview Mockup */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Chatbot Preview</span>
              
              {/* Preview 1: Floating Button & Header Mock */}
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                {/* Floating Button Mock */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#0249ad] to-[#1e40af] p-0.5 flex items-center justify-center shadow-md">
                  <img 
                    src={getBotLogo(settings.bot_logo_path)} 
                    alt="Bot Logo Mock" 
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                </div>

                {/* Header Mock */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate">BudgetEV AI</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold truncate">Flagship EV Expert</p>
                </div>
              </div>

              {/* Preview 2: Message Bubble Mock */}
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <img 
                  src={getBotLogo(settings.bot_logo_path)} 
                  alt="Bot Logo Message Mock" 
                  className="w-6 h-6 rounded-full object-cover shadow-sm mt-0.5" 
                />
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl rounded-tl-none p-2 text-[10px] text-slate-600 font-semibold leading-relaxed">
                  Hi! I'm your custom EV assistant.
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Assistant Status</h2>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enable Assistant</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="enabled"
                  checked={settings.enabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e40af]"></div>
              </label>
            </div>

            <TextArea
              label="Bot Welcome Message"
              name="welcome_message"
              value={settings.welcome_message}
              onChange={handleChange}
              placeholder="Greeting shown to user on chat initialization..."
              className="h-24"
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider">Model Parameters</h2>
            
            <Select
              label="Gemini Model"
              name="gemini_model"
              value={settings.gemini_model}
              onChange={handleChange}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </Select>

            <Input
              label="Temperature (0.0 to 1.0)"
              name="temperature"
              type="number"
              min="0.0"
              max="1.0"
              step="0.1"
              value={settings.temperature}
              onChange={handleChange}
            />

            <Input
              label="Max Tokens"
              name="max_tokens"
              type="number"
              value={settings.max_tokens}
              onChange={handleChange}
            />
          </Card>

          <Card className="p-4 space-y-2">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="large"
              className="w-full"
              icon={Save}
            >
              {loading ? 'Saving AI Settings...' : 'Save AI Settings'}
            </Button>
          </Card>
        </div>

      </form>

      {cropperSrc && (
        <CustomCropper 
          imageSrc={cropperSrc}
          aspectRatio={1}
          onCrop={handleCropComplete}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </div>
  );
}
