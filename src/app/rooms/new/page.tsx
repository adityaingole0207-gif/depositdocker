'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BuildingIcon, ArrowLeftIcon, DocumentIcon } from '@/components/SvgIcons';
import { useLanguage } from '@/components/LanguageContext';

export default function NewRoomPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('1BHK Flat');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Akurdi');
  const [city, setCity] = useState('Pune / PCMC');
  const [pincode, setPincode] = useState('411044');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [agreementFile, setAgreementFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let agreementUrl = null;
      if (agreementFile) {
        const formData = new FormData();
        formData.append('photo', agreementFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          agreementUrl = uploadData.fileUrl;
        }
      }

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          propertyType,
          address,
          area,
          city,
          pincode,
          monthlyRent,
          securityDeposit,
          leaseStartDate,
          leaseEndDate,
          landlordName,
          landlordPhone,
          landlordEmail,
          agreementUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');

      router.push(`/rooms/${data.room.id}/move-in`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-4"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Return to Ledger Dashboard</span>
      </Link>

      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-8 shadow-paper-lg space-y-6">
        <div className="border-b-2 border-ink dark:border-paper-400 pb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold">
            FORM DL-01 • NEW TENANCY ENTRY
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
            Register Property & Tenancy Particulars
          </h1>
          <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
            Fill in lease details to initialize the tamper-evident move-in condition audit.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-vermilion-50 border border-vermilion-500 text-vermilion-600 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Property Identity */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100 border-b border-paper-300 pb-1">
              1. Property Identification
            </h3>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Property / Room Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wakad Datta Mandir Road 1BHK, or Akurdi Sector 26 PG Room"
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Property Configuration
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
                >
                  <option value="1BHK Flat">1BHK Flat</option>
                  <option value="2BHK Flat">2BHK Flat</option>
                  <option value="2BHK Shared Flat">2BHK Shared Flat</option>
                  <option value="Single PG Room">Single PG Room (Private)</option>
                  <option value="Shared PG Room">Shared PG Room (Twin/Triple)</option>
                  <option value="Studio Apartment">Studio Apartment</option>
                  <option value="1RK Flat">1RK Flat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Pune / PCMC Locality *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
                >
                  <option value="Akurdi">Akurdi (Pradhikaran / DY Patil)</option>
                  <option value="Wakad">Wakad (Datta Mandir / Bhumkar Chowk)</option>
                  <option value="Hinjewadi">Hinjewadi (Phase 1, 2, 3)</option>
                  <option value="Nigdi">Nigdi (Pradhikaran / Yamuna Nagar)</option>
                  <option value="Chinchwad">Chinchwad (Station / Auto Cluster)</option>
                  <option value="Kothrud">Kothrud (MIT / Karve Nagar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Full Physical Address *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, Sai Heights, Near Dange Chowk, Wakad"
                className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Financial Terms */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100 border-b border-paper-300 pb-1">
              2. Financial Custody & Lease Term
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Security Deposit (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Monthly Rent (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="e.g. 16000"
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={leaseStartDate}
                  onChange={(e) => setLeaseStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Lease Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={leaseEndDate}
                  onChange={(e) => setLeaseEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Landlord Particulars & Agreement Upload */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100 border-b border-paper-300 pb-1">
              3. Landlord / Property Owner Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Landlord Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="e.g. Suresh Patil"
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Phone (for WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={landlordPhone}
                  onChange={(e) => setLandlordPhone(e.target.value)}
                  placeholder="+91 98220 00000"
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={landlordEmail}
                  onChange={(e) => setLandlordEmail(e.target.value)}
                  placeholder="landlord@example.com"
                  className="w-full px-3 py-2 text-sm border-2 border-ink dark:border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                Upload Registered Rent Agreement (PDF / Image)
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setAgreementFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-mono border-2 border-dashed border-paper-400 bg-paper-50 dark:bg-paper-800 p-3 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-ink file:text-paper-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t-2 border-ink dark:border-paper-400 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-ink-light dark:text-paper-400 hover:underline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-forest-600 text-paper-100 font-mono font-bold text-xs uppercase tracking-widest hover:bg-forest-700 disabled:opacity-50 transition-colors shadow-paper"
            >
              {loading ? 'Creating Record...' : 'Save & Start Move-in Walkthrough →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
