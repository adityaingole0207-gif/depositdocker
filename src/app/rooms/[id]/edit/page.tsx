'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/SvgIcons';

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setTitle(data.room.title);
          setPropertyType(data.room.propertyType);
          setAddress(data.room.address);
          setArea(data.room.area);
          setMonthlyRent(String(data.room.monthlyRent));
          setSecurityDeposit(String(data.room.securityDeposit));
          setLandlordName(data.room.landlordName);
          setLandlordPhone(data.room.landlordPhone);
          setLandlordEmail(data.room.landlordEmail || '');
          setStatus(data.room.status);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          propertyType,
          address,
          area,
          monthlyRent: Number(monthlyRent),
          securityDeposit: Number(securityDeposit),
          landlordName,
          landlordPhone,
          landlordEmail,
          status,
        }),
      });

      if (!res.ok) throw new Error('Failed to update room');
      router.push(`/rooms/${params.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating room');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading room particulars...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/rooms/${params.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-4"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Return to Room Ledger</span>
      </Link>

      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-8 shadow-paper-lg space-y-6">
        <div className="border-b-2 border-ink dark:border-paper-400 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold">
            EDIT RECORD ENTRY
          </span>
          <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
            Update Room & Landlord Details
          </h1>
        </div>

        {error && (
          <div className="p-3 bg-vermilion-50 border border-vermilion-500 text-vermilion-600 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Property Type
              </label>
              <input
                type="text"
                required
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Locality / Area
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Monthly Rent (INR)
              </label>
              <input
                type="number"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Security Deposit (INR)
              </label>
              <input
                type="number"
                required
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Landlord Name
              </label>
              <input
                type="text"
                required
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Landlord Phone
              </label>
              <input
                type="tel"
                required
                value={landlordPhone}
                onChange={(e) => setLandlordPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-paper-400 flex items-center justify-between">
            <Link
              href={`/rooms/${params.id}`}
              className="text-xs font-mono text-ink-light hover:underline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-ink text-paper-100 font-mono font-bold text-xs uppercase hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
