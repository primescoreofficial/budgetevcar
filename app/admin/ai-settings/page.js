'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, AlertCircle, Plus, X, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Button, Input, TextArea, Select } from '@/app/admin/components/DesignSystem';

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
    enabled: true
  });

  const [newQuestion, setNewQuestion] = useState('');

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
            enabled: data.enabled !== undefined ? data.enabled : true
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
    </div>
  );
}
