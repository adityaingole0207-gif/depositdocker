'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SealIcon } from '@/components/SvgIcons';
import { LanguageCode } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          preferredLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-8 shadow-paper-lg relative">
        <div className="flex items-center justify-between pb-4 border-b border-paper-400">
          <div className="flex items-center gap-2">
            <SealIcon className="w-5 h-5 text-forest-600" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-paper-100">
              TENANT REGISTRATION
            </span>
          </div>
          <span className="text-[10px] font-mono text-ink-light dark:text-paper-400">
            RECORD CREATION
          </span>
        </div>

        <div className="py-4 space-y-1">
          <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
            Create Your Tenant Account
          </h1>
          <p className="text-xs text-ink-light dark:text-paper-300">
            Anchor your move-in condition before signing the handover slip.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-vermilion-50 dark:bg-vermilion-900/30 border border-vermilion-500 text-vermilion-600 dark:text-vermilion-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@example.com"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98220 00000"
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Password (Min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-600 text-paper-100 font-mono font-bold text-xs uppercase tracking-widest hover:bg-forest-700 disabled:opacity-50 transition-colors shadow-paper"
          >
            {loading ? 'Creating Official Record...' : 'Register & Enter Ledger'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-paper-400 text-center text-xs text-ink-light dark:text-paper-400">
          Already registered?{' '}
          <Link href="/auth/login" className="font-bold text-ink dark:text-paper-100 underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
