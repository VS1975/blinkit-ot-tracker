'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    captainId: '',
    captainName: '',
    purpose: 'PUTAWAY',
    otEntry: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/submit-ot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'OT entry submitted successfully!' });
        setFormData({
          captainId: '',
          captainName: '',
          purpose: 'PUTAWAY',
          otEntry: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit OT entry' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      captainId: '',
      captainName: '',
      purpose: 'PUTAWAY',
      otEntry: '',
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            OT Entry Tracker
          </h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Admin Login
          </Link>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Captain ID */}
            <div>
              <label htmlFor="captainId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CAPTAIN ID
              </label>
              <input
                type="text"
                id="captainId"
                value={formData.captainId}
                onChange={(e) => setFormData({ ...formData, captainId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter Captain ID"
                required
              />
            </div>

            {/* Captain Name */}
            <div>
              <label htmlFor="captainName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CAPTAIN NAME
              </label>
              <input
                type="text"
                id="captainName"
                value={formData.captainName}
                onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter Captain Name"
                required
              />
            </div>

            {/* Purpose of OT */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PURPOSE OF OT
              </label>
              <select
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="PUTAWAY">PUTAWAY</option>
                <option value="PICKING">PICKING</option>
                <option value="AUDIT">AUDIT</option>
              </select>
            </div>

            {/* OT Entry Data */}
            <div>
              <label htmlFor="otEntry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                FEED YOUR DATA BELOW (Format: DD MONTH - X HR OT)
              </label>
              <input
                type="text"
                id="otEntry"
                value={formData.otEntry}
                onChange={(e) => setFormData({ ...formData, otEntry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Example: 12 March - 3 HR OT"
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Example: 12 March - 3 HR OT
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                Clear Form
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Never submit passwords through forms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
