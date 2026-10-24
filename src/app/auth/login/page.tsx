'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SealIcon, LockIcon } from '@/components/SvgIcons';
import { useLanguage } from '@/components/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemoCredentials = () => {
    setEmail('demo@depositlocker.com');
    setPassword('demo123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-8 shadow-paper-lg relative">
        {/* Ledger Top Stamp */}
        <div className="flex items-center justify-between pb-4 border-b border-paper-400">
          <div className="flex items-center gap-2">
            <SealIcon className="w-5 h-5 text-forest-600" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-paper-100">
              TENANT LOGIN ENTRY
            </span>
          </div>
          <span className="text-[10px] font-mono text-ink-light dark:text-paper-400">
            SECURE ACCESS
          </span>
        </div>

        <div className="py-4 space-y-1">
          <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
            Access Your Inspection Records
          </h1>
          <p className="text-xs text-ink-light dark:text-paper-300">
            Enter your credentials or use the demo login to review locked deposit certificates.
          </p>
        </div>

        {/* Demo Fast-Fill Button */}
        <div className="p-3 bg-paper-200 dark:bg-paper-800 border border-paper-400 text-xs font-mono space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-forest-600">PRE-SEEDED DEMO ACCOUNT</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-2 py-0.5 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink hover:opacity-90 font-mono text-[10px] font-bold"
            >
              Fill Demo Login
            </button>
          </div>
          <div className="text-[11px] text-ink-light dark:text-paper-300">
            Email: <span className="underline">demo@depositlocker.com</span> | Pass: <span className="underline">demo123</span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-vermilion-50 dark:bg-vermilion-900/30 border border-vermilion-500 text-vermilion-600 dark:text-vermilion-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Registered Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rohan.sharma@gmail.com"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] font-mono text-ink-light dark:text-paper-400 hover:text-ink underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity shadow-paper"
          >
            {loading ? 'Validating Token...' : 'Authenticate & Enter Ledger'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-paper-400 text-center text-xs text-ink-light dark:text-paper-400">
          First time documenting a rental?{' '}
          <Link href="/auth/register" className="font-bold text-forest-600 underline">
            Register Tenant Account
          </Link>
        </div>
      </div>
    </div>
  );
}
