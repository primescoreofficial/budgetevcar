'use client';

import { useState } from 'react';

export default function FooterQueryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmitted(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: '',
        });
        setErrors({});
      } else {
        setSubmitError(result.error || 'Failed to send query. Please try again.');
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center space-y-2">
        <p className="text-xs font-bold text-emerald-400">✅ Query Sent Successfully!</p>
        <p className="text-[11px] text-slate-400">We will get back to you soon.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSubmitError('');
          }}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
        >
          Submit another query
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-2" noValidate>
      <div>
        <input
          id="footer-name"
          type="text"
          name="name"
          value={formData.name}
          disabled={isSubmitting}
          onChange={handleChange}
          placeholder="Name *"
          aria-label="Name"
          className={`w-full bg-slate-900 ${
            errors.name ? 'ring-1 ring-red-500/70' : ''
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:outline-none transition disabled:opacity-50`}
          aria-required="true"
        />
        {errors.name && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.name}</p>}
      </div>

      <div>
        <input
          id="footer-email"
          type="email"
          name="email"
          value={formData.email}
          disabled={isSubmitting}
          onChange={handleChange}
          placeholder="Email *"
          aria-label="Email"
          className={`w-full bg-slate-900 ${
            errors.email ? 'ring-1 ring-red-500/70' : ''
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:outline-none transition disabled:opacity-50`}
          aria-required="true"
        />
        {errors.email && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.email}</p>}
      </div>

      <div>
        <textarea
          id="footer-message"
          name="message"
          rows={2}
          value={formData.message}
          disabled={isSubmitting}
          onChange={handleChange}
          placeholder="Query / Message *"
          aria-label="Query or Message"
          className={`w-full bg-slate-900 ${
            errors.message ? 'ring-1 ring-red-500/70' : ''
          } text-slate-100 placeholder-slate-500 px-3 py-2.5 sm:py-1.5 rounded-lg text-sm sm:text-xs font-medium focus:ring-1 focus:ring-slate-800 focus:outline-none transition resize-none disabled:opacity-50`}
          aria-required="true"
        />
        {errors.message && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.message}</p>}
      </div>

      {submitError && (
        <p className="text-[10px] text-red-400 font-semibold">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-2.5 sm:py-1.5 px-4 rounded-lg text-sm sm:text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Sending...' : 'Submit Query'}
      </button>
    </form>
  );
}
