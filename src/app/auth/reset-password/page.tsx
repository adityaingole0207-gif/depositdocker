'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SealIcon } from '@/components/SvgIcons';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-8 shadow-paper-lg relative">
      <div className="flex items-center gap-2 pb-4 border-b border-paper-400">
        <SealIcon className="w-5 h-5 text-forest-600" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-paper-100">
          RESET RECORD ACCESS
        </span>
      </div>

      <div className="py-4 space-y-1">
        <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
          Set New Password
        </h1>
        <p className="text-xs text-ink-light dark:text-paper-300">
          Enter your new secure password below to regain full ledger access.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-vermilion-50 border border-vermilion-500 text-vermilion-600 text-xs font-mono">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 bg-forest-50 border border-forest-600 text-forest-800 text-xs font-mono">
          Password updated successfully! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Updating Credentials...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Suspense fallback={<div className="font-mono text-xs text-center py-12">Loading token verification...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
