'use client';

import { useState, useEffect, useRef } from 'react';

export default function FooterQueryForm({ onSuccess, isMobileSheet = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isMobileSheet && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 100);
    }
  }, [isMobileSheet]);

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = 'Invalid email address';
      }
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (errors.submit) {
      setErrors((prev) => ({
        ...prev,
        submit: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          query: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit query.');
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
      });
      setErrors({});
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || 'An error occurred. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div className="bg-slate-900/45 border border-slate-800 rounded-xl p-4 text-center space-y-2">
        <p className="text-xs font-bold text-emerald-400">\u2705 Query Submitted Successfully!</p>
        <p className="text-[11px] text-slate-400">We will get back to you soon.</p>
        <button
          onClick={() => {
            setSubmitted(false);
          }}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
        >
          Submit another query
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 md:space-y-2" noValidate>
      <div>
        <input
          id="footer-name"
          ref={nameInputRef}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name *"
          aria-label="Name"
          className={`w-full bg-slate-900 border border-slate-800 ${
            errors.name ? 'border-red-500 ring-1 ring-red-500/30' : 'hover:border-slate-700'
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 rounded-lg text-sm md:text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200`}
          aria-required="true"
        />
        {errors.name && <p className="text-[10px] text-red-400 mt-1 font-bold tracking-wide pl-1">{errors.name}</p>}
      </div>

      <div>
        <input
          id="footer-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email *"
          aria-label="Email"
          className={`w-full bg-slate-900 border border-slate-800 ${
            errors.email ? 'border-red-500 ring-1 ring-red-500/30' : 'hover:border-slate-700'
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 rounded-lg text-sm md:text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200`}
          aria-required="true"
        />
        {errors.email && <p className="text-[10px] text-red-400 mt-1 font-bold tracking-wide pl-1">{errors.email}</p>}
      </div>

      <div>
        <textarea
          id="footer-message"
          name="message"
          rows={2}
          value={formData.message}
          onChange={handleChange}
          placeholder="Query / Message *"
          aria-label="Query or Message"
          className={`w-full bg-slate-900 border border-slate-800 ${
            errors.message ? 'border-red-500 ring-1 ring-red-500/30' : 'hover:border-slate-700'
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 rounded-lg text-sm md:text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 resize-none`}
          aria-required="true"
        />
        {errors.message && <p className="text-[10px] text-red-400 mt-1 font-bold tracking-wide pl-1">{errors.message}</p>}
      </div>

      {errors.submit && (
        <p className="text-[10px] text-red-400 mt-1 font-bold tracking-wide text-center">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold py-2.5 px-4 rounded-lg text-xs transition-all duration-200 shadow-md shadow-blue-900/10 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Query'}
      </button>
    </form>
  );
}
