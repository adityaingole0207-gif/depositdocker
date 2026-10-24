'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SealIcon } from '@/components/SvgIcons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'Reset token generated');
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-8 shadow-paper-lg relative">
        <div className="flex items-center gap-2 pb-4 border-b border-paper-400">
          <SealIcon className="w-5 h-5 text-forest-600" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-paper-100">
            RECOVER CREDENTIALS
          </span>
        </div>

        <div className="py-4 space-y-1">
          <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
            Password Recovery
          </h1>
          <p className="text-xs text-ink-light dark:text-paper-300">
            Enter your registered email address to receive an official recovery token.
          </p>
        </div>

        {resetUrl ? (
          <div className="p-4 bg-forest-50 border border-forest-500 space-y-3">
            <p className="text-xs font-mono text-forest-700 font-bold">
              Password Reset Token Generated:
            </p>
            <p className="text-xs text-ink-light">
              For testing convenience in this prototype, click below to proceed directly:
            </p>
            <Link
              href={resetUrl}
              className="block text-center py-2 bg-forest-600 text-paper-100 font-mono text-xs font-bold hover:bg-forest-700"
            >
              Set New Password Now →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@depositlocker.com"
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Generating Token...' : 'Generate Password Reset Token'}
            </button>
          </form>
        )}

        <div className="pt-6 mt-6 border-t border-paper-400 text-center text-xs">
          <Link href="/auth/login" className="font-mono text-ink-light dark:text-paper-400 underline">
            Back to Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
