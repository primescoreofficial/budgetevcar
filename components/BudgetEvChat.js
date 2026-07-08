'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Trash2, RefreshCw, Copy, Check, Sparkles, 
  ExternalLink, Compass
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Suggested questions for initial welcome state
const SUGGESTED_QUESTIONS = [
  { text: 'Best EV for city driving' },
  { text: 'Compare Nexon EV and Curvv EV' },
  { text: 'Longest Range EV in India' },
  { text: 'Explain EV Battery Technology' },
  { text: 'Recommend an EV for daily commute' },
  { text: 'What is V2L and fast charging?' }
];

export default function BudgetEvChat() {
  console.log("BudgetEvChat component rendered!");
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorState, setErrorState] = useState(null); // 'busy' | 'error' | null
  
  const [aiSettings, setAiSettings] = useState({
    welcome_message: "Hello! I am your BudgetEV assistant. Ask me anything about electric cars.",
    suggested_questions: SUGGESTED_QUESTIONS,
    enabled: true
  });

  useEffect(() => {
    const fetchAiSettings = async () => {
      try {
        const { data } = await supabase
          .from('ai_settings')
          .select('*')
          .eq('id', 'default')
          .single();
        if (data) {
          setAiSettings({
            welcome_message: data.welcome_message || "Hello! I am your BudgetEV assistant. Ask me anything about electric cars.",
            suggested_questions: Array.isArray(data.suggested_questions) && data.suggested_questions.length > 0
              ? data.suggested_questions
              : SUGGESTED_QUESTIONS,
            enabled: data.enabled !== false
          });
        }
      } catch (e) {
        console.warn('Failed to load AI settings:', e);
      }
    };
    fetchAiSettings();
  }, []);

  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Delay rendering to avoid overlapping with the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of chat when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus trap & keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 150);
    }
  }, [isOpen]);

  // Parse server response which might contain structured JSON
  const parseServerResponse = (text) => {
    let cleanText = text.trim();
    // Try to extract JSON from markdown block
    const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/) || cleanText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanText = jsonMatch[1];
    }

    try {
      const parsed = JSON.parse(cleanText.trim());
      if (parsed && typeof parsed === 'object' && parsed.type) {
        return parsed;
      }
    } catch (e) {
      // Not JSON or parse failed
    }

    return {
      type: 'text',
      text: text
    };
  };

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || isLoading) return;

    setErrorState(null);

    const userMsg = { role: 'user', content: promptText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('quota_exceeded');
        }
        throw new Error('failed');
      }

      const data = await response.json();
      const parsedContent = parseServerResponse(data.content);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: parsedContent
      }]);
    } catch (err) {
      console.error('AI chat request failed:', err);
      if (err.message === 'quota_exceeded') {
        setErrorState('busy');
      } else {
        setErrorState('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1].content;
      handleSend(lastUserMsg);
    }
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setErrorState(null);
  };

  const getCarUrl = (slug) => {
    if (!slug) return '#';
    if (slug.startsWith('/')) return slug;
    return `/cars/${slug}`;
  };

  const renderRecommendation = (recommendationData) => {
    const cars = recommendationData?.cars || [];
    if (cars.length === 0) return null;

    return (
      <div className="mt-4 grid grid-cols-1 gap-3 w-full">
        {cars.map((car, idx) => (
          <div 
            key={idx} 
            className="flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {car.name}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{car.brand || 'EV Vehicle'}</p>
              </div>
              <Link 
                href={getCarUrl(car.slug)}
                className="text-[#0249ad] hover:text-[#1e40af] p-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition flex items-center gap-1 text-[11px] font-extrabold"
              >
                <span>View EV</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
              {car.reason}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderComparison = (comparisonData) => {
    const cars = comparisonData?.cars || [];
    if (cars.length === 0) return null;

    return (
      <div className="mt-4 w-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[280px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specs</th>
                {cars.map((car, idx) => (
                  <th key={idx} className="px-3 py-2 text-[10px] font-bold text-[#0249ad] uppercase tracking-wider truncate max-w-[100px]">
                    {car.name.replace(/Motors |Tata |MG |BYD |Hyundai |Mahindra /g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {['range', 'battery_capacity', 'charging_speed', 'body_type', 'safety'].map((specKey) => {
                const label = specKey.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <tr key={specKey} className="hover:bg-slate-50/40">
                    <td className="px-3 py-2 font-bold text-slate-500 text-[10px]">{label}</td>
                    {cars.map((car, idx) => (
                      <td key={idx} className="px-3 py-2 text-slate-900">
                        {car.specs?.[specKey] || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/50 border-t border-slate-100 space-y-2.5">
          {cars.map((car, idx) => (
            <div key={idx} className="text-xs">
              <span className="font-extrabold text-slate-800">{car.name}:</span>
              {car.specs?.pros && (
                <div className="text-[11px] text-green-700 mt-0.5 flex flex-wrap gap-x-2 font-medium">
                  <span className="font-bold text-green-800">✓ Pros:</span> {car.specs.pros.join(', ')}
                </div>
              )}
              {car.specs?.cons && (
                <div className="text-[11px] text-red-600 mt-0.5 flex flex-wrap gap-x-2 font-medium">
                  <span className="font-bold text-red-800">✗ Cons:</span> {car.specs.cons.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        {comparisonData.recommendation && (
          <div className="p-3 bg-blue-50/30 border-t border-slate-100 text-xs font-semibold text-slate-700 leading-relaxed">
            <span className="font-extrabold text-[#0249ad] block mb-0.5">BudgetEV Recommendation:</span>
            {comparisonData.recommendation}
          </div>
        )}

        <div className="p-2 bg-white border-t border-slate-100 flex gap-2 justify-end">
          {cars.map((car, idx) => (
            <Link
              key={idx}
              href={getCarUrl(car.slug)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-100 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 transition"
            >
              View {car.name.split(' ').slice(-2).join(' ')}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (!showButton || !aiSettings.enabled) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .loader {
          width: 12px;
          aspect-ratio: 1.154;
          --_g: no-repeat radial-gradient(farthest-side, #000 90%, #0000);
          background:
            var(--_g) 50% 0,
            var(--_g) 0 100%,
            var(--_g) 100% 100%;
          background-size: 35% calc(35% * 1.154);
          animation: l16 1s infinite;
          
        }

        @keyframes l16 {
          50%,
          100% {
            background-position: 100% 100%, 50% 0, 0 100%;
          }
        }
        /* Specific override to show scrollbars inside the chat window */
        div.custom-scrollbar::-webkit-scrollbar {
          display: block !important;
          width: 6px !important;
        }
        div.custom-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        div.custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 10px !important;
        }
        div.custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }
      `}} />
      {/* Floating Trigger Button */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #0249ad 0%, #1e40af 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            outline: 'none',
            position: 'relative',
          }}
          aria-label={isOpen ? "Close BudgetEV AI Consultant" : "Chat with BudgetEV AI Consultant"}
        >
          {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <img src="/logo/budgetev-ai-assistant.jpg" alt="BudgetEV AI Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            display: 'block',
            width: '10px',
            height: '10px',
            borderRadius: '9999px',
            backgroundColor: '#4ade80',
            boxShadow: '0 0 0 2px white',
          }} />
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '520px',
            maxWidth: '92vw',
            height: '660px',
            maxHeight: '76vh',
            zIndex: 99999,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          className="rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ease-out animate-fadeIn"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <img src="/logo/budgetev-ai-assistant.jpg" alt="BudgetEV AI Avatar" className="w-9 h-9 rounded-full object-cover shadow-md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-slate-800 tracking-tight">BudgetEV AI</span>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Flagship EV Expert</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button 
                  onClick={clearChat}
                  title="Clear Conversation"
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div 
            style={{ overscrollBehavior: 'contain' }}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-6 animate-fadeIn">
                <img src="/logo/budgetev-ai-assistant.jpg" alt="BudgetEV AI Logo" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800">Hi, I'm BudgetEV AI</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-[260px] mx-auto leading-relaxed">
                    {aiSettings.welcome_message}
                  </p>
                </div>

                <div className="w-full pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-left mb-2 px-1">Suggested Questions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {aiSettings.suggested_questions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(item.text)}
                        className="p-3 bg-slate-50/50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition hover:border-slate-200 cursor-pointer flex items-center justify-center text-center group"
                      >
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  
                  if (isUser) {
                    return (
                      <div key={index} className="flex justify-end animate-fadeIn">
                        <div className="max-w-[85%] bg-slate-100 text-black rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs font-semibold shadow-sm leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const chatObj = msg.content;
                  const text = chatObj.text || '';

                  return (
                    <div key={index} className="flex justify-start items-start gap-2.5 animate-fadeIn">
                      <img src="/logo/budgetev-ai-assistant.jpg" alt="AI" className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0 mt-0.5" />
                      <div className="max-w-[85%] space-y-2">
                        <div className="bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed font-semibold shadow-inner relative group/msg">
                          <div className="prose prose-sm text-slate-700 whitespace-pre-line font-medium">
                            {text}
                          </div>

                          {chatObj.type === 'recommendation' && renderRecommendation(chatObj.recommendation)}
                          {chatObj.type === 'comparison' && renderComparison(chatObj.comparison)}

                          <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 flex gap-1">
                            <button
                              onClick={() => handleCopyText(text, index)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition"
                              title="Copy message text"
                            >
                              {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start items-start gap-2.5 animate-fadeIn">
                    <img src="/logo/budgetev-ai-assistant.jpg" alt="AI" className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0 mt-0.5" />
                    <div 
                      className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm shadow-inner flex items-center justify-center"
                      style={{ padding: '14px' }}
                    >
                      <div className="loader" />
                    </div>
                  </div>
                )}

                {errorState && (
                  <div className="flex justify-start items-start gap-2.5 animate-fadeIn">
                    <img src="/logo/budgetev-ai-assistant.jpg" alt="AI" className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0 mt-0.5" />
                    <div className="bg-red-50 border border-red-100 text-red-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed font-semibold shadow-inner space-y-2">
                      <p>
                        {errorState === 'busy' 
                          ? 'BudgetEV AI is currently busy. Please try again later.'
                          : 'An unexpected connection issue occurred. Please check your network and try again.'}
                      </p>
                      <button 
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 bg-white hover:bg-red-100/50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl transition text-[10px] font-bold cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Query</span>
                      </button>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1.5 focus-within:border-[#0249ad] focus-within:bg-white transition-all duration-200"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask BudgetEV AI about EVs..."
                className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none py-1.5 font-semibold placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:bg-slate-50 disabled:border-slate-100 text-black disabled:text-slate-300 rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </form>
            <div className="text-[9px] text-slate-400 font-semibold text-center mt-2.5">
              Powered by BudgetEV Consultant. Strict EV database matches only.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
