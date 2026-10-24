'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CameraIcon,
  CheckIcon,
  ShieldCheckIcon,
  LockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AlertIcon,
} from '@/components/SvgIcons';
import { ProgressRing } from '@/components/ProgressRing';
import { StatusStamp } from '@/components/StatusStamp';
import { SignaturePad } from '@/components/SignaturePad';
import { computeClientFileHash } from '@/lib/crypto';

interface ChecklistItem {
  id: string;
  code: string;
  category: string;
  name: string;
  typicalRepairCostInr: number;
  damageHint: string;
  wearTolerance: string;
  sortOrder: number;
}

interface ItemEntry {
  checklistItemId: string;
  conditionRating: number;
  notes: string;
  photos: Array<{
    fileUrl: string;
    sha256Hash: string;
    serverTimestamp?: string;
  }>;
}

const CATEGORIES = [
  'Walls and Paint',
  'Flooring',
  'Ceiling',
  'Doors and Windows',
  'Furniture',
  'Electrical',
  'Bathroom',
  'Kitchen/Balcony',
  'Safety',
];

export default function MoveInWalkthroughPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [allChecklist, setAllChecklist] = useState<ChecklistItem[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [itemEntries, setItemEntries] = useState<Record<string, ItemEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [tenantSignature, setTenantSignature] = useState('Verified Tenant');
  const [showLockModal, setShowLockModal] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockedSuccess, setLockedSuccess] = useState(false);

  // File input ref for camera capture
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeItemIdForPhoto = useRef<string | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          const moveIn = data.room.reports?.find((r: any) => r.type === 'MOVE_IN');
          setReport(moveIn);

          // Populate existing items
          const initialMap: Record<string, ItemEntry> = {};
          if (moveIn && moveIn.items) {
            moveIn.items.forEach((it: any) => {
              initialMap[it.checklistItemId] = {
                checklistItemId: it.checklistItemId,
                conditionRating: it.conditionRating,
                notes: it.notes || '',
                photos: it.photos || [],
              };
            });
          }
          setItemEntries(initialMap);
        }
        if (data.checklistItems) {
          setAllChecklist(data.checklistItems);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const itemsInCurrentCategory = allChecklist.filter((c) => c.category === currentCategory);

  // Completion calculation
  const totalItemsCount = allChecklist.length || 40;
  const inspectedCount = Object.keys(itemEntries).length;
  const progressPercent = (inspectedCount / totalItemsCount) * 100;

  const handleRatingChange = (itemId: string, rating: number) => {
    setItemEntries((prev) => {
      const current = prev[itemId] || {
        checklistItemId: itemId,
        conditionRating: 5,
        notes: '',
        photos: [],
      };
      return {
        ...prev,
        [itemId]: { ...current, conditionRating: rating },
      };
    });
    triggerAutoSave(itemId, rating, itemEntries[itemId]?.notes || '');
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setItemEntries((prev) => {
      const current = prev[itemId] || {
        checklistItemId: itemId,
        conditionRating: 5,
        notes: '',
        photos: [],
      };
      return {
        ...prev,
        [itemId]: { ...current, notes },
      };
    });
  };

  const triggerAutoSave = async (itemId: string, rating: number, notes: string) => {
    if (!report) return;
    setSaving(true);
    try {
      await fetch(`/api/reports/${report.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              checklistItemId: itemId,
              conditionRating: rating,
              notes,
              photos: itemEntries[itemId]?.photos || [],
            },
          ],
        }),
      });
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const triggerCamera = (itemId: string) => {
    activeItemIdForPhoto.current = itemId;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = activeItemIdForPhoto.current;
    if (!file || !itemId || !report) return;

    setUploadingItem(itemId);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('lastModified', String(file.lastModified));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const photoData = await res.json();

      const newPhotos = [
        ...(itemEntries[itemId]?.photos || []),
        {
          fileUrl: photoData.fileUrl,
          sha256Hash: photoData.sha256Hash,
          serverTimestamp: photoData.serverTimestamp,
        },
      ];

      setItemEntries((prev) => {
        const current = prev[itemId] || {
          checklistItemId: itemId,
          conditionRating: 5,
          notes: '',
          photos: [],
        };
        return {
          ...prev,
          [itemId]: { ...current, photos: newPhotos },
        };
      });

      // Save to server
      await fetch(`/api/reports/${report.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              checklistItemId: itemId,
              conditionRating: itemEntries[itemId]?.conditionRating || 5,
              notes: itemEntries[itemId]?.notes || '',
              photos: newPhotos,
            },
          ],
        }),
      });
    } catch (err) {
      console.error(err);
      alert('Photo upload failed. Please try again.');
    } finally {
      setUploadingItem(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSealAndLock = async () => {
    if (!report) return;
    setLocking(true);
    try {
      // First save all current item entries
      const itemsPayload = Object.values(itemEntries);
      await fetch(`/api/reports/${report.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          tenantSignature,
        }),
      });

      // Now lock the report permanently
      const lockRes = await fetch(`/api/reports/${report.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSignature }),
      });

      if (!lockRes.ok) throw new Error('Failed to lock report');
      setLockedSuccess(true);
      setTimeout(() => {
        router.push(`/reports/${report.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to lock report. Please ensure items are recorded.');
    } finally {
      setLocking(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center font-mono text-sm text-ink-light">
        Loading Move-in Walkthrough Registry...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hidden camera input for mobile photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />

      {/* Top Ledger Header */}
      <div className="border-2 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-paper">
        <div>
          <Link
            href={`/rooms/${room.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-1"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            <span>Back to Room Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-2xl text-ink dark:text-paper-100">
              Move-In Condition Walkthrough
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-forest-600 text-forest-600 font-bold">
              TAMPER-EVIDENT
            </span>
          </div>
          <p className="text-xs text-ink-light dark:text-paper-300">
            {room.title} ({room.area}) • Report No: <span className="font-mono font-bold">{report?.reportNumber}</span>
          </p>
        </div>

        {/* Progress & Lock Action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <ProgressRing progress={progressPercent} size={48} strokeWidth={5} />
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-ink dark:text-paper-100">
                {inspectedCount} of {totalItemsCount}
              </span>
              <span className="block text-[10px] font-mono text-ink-light dark:text-paper-400">
                Items Documented
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLockModal(true)}
            className="px-4 py-2.5 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-forest-700 shadow flex items-center gap-1.5 transition-colors"
          >
            <LockIcon className="w-4 h-4" />
            <span>Seal & Lock</span>
          </button>
        </div>
      </div>

      {/* Main Walkthrough Layout: Left Step Tracker + Right Category Items */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Vertical Step Tracker */}
        <div className="lg:col-span-1 space-y-2">
          <div className="border-2 border-ink dark:border-paper-400 bg-paper-100 dark:bg-paper-900 p-4 shadow-paper">
            <div className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold pb-2 border-b border-paper-400">
              CHECKLIST CATEGORIES
            </div>

            <nav className="mt-3 space-y-1">
              {CATEGORIES.map((cat, idx) => {
                const itemsInCat = allChecklist.filter((c) => c.category === cat);
                const inspectedInCat = itemsInCat.filter((c) => itemEntries[c.id]).length;
                const isSelected = idx === currentCategoryIndex;
                const isComplete = itemsInCat.length > 0 && inspectedInCat === itemsInCat.length;

                return (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'border-ink bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-bold shadow-sm'
                        : 'border-transparent text-ink-light hover:bg-paper-200 dark:text-paper-300 dark:hover:bg-paper-800'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] ml-2">
                      {isComplete ? (
                        <CheckIcon className="w-3.5 h-3.5 text-forest-500" />
                      ) : (
                        `${inspectedInCat}/${itemsInCat.length}`
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Evidence Integrity Card */}
          <div className="border border-paper-400 bg-paper-50 dark:bg-paper-800 p-3.5 text-xs font-mono space-y-1.5">
            <span className="font-bold text-forest-600 block">CRYPTO EVIDENCE STAMP</span>
            <p className="text-[11px] text-ink-light dark:text-paper-300">
              Photos uploaded directly compute SHA-256 digests and extract camera EXIF timestamps to prevent backdated claims.
            </p>
          </div>
        </div>

        {/* Right Inspection Cards */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-paper-200 dark:bg-paper-800 border-2 border-ink dark:border-paper-400 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold">
                CATEGORY {currentCategoryIndex + 1} OF {CATEGORIES.length}
              </span>
              <h2 className="font-serif font-black text-xl text-ink dark:text-paper-100">
                {currentCategory}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentCategoryIndex === 0}
                onClick={() => setCurrentCategoryIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 text-xs font-mono border border-ink disabled:opacity-30 bg-paper-100 text-ink dark:bg-paper-700 dark:text-paper-100"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentCategoryIndex === CATEGORIES.length - 1}
                onClick={() => setCurrentCategoryIndex((prev) => Math.min(CATEGORIES.length - 1, prev + 1))}
                className="px-2.5 py-1 text-xs font-mono border border-ink disabled:opacity-30 bg-paper-100 text-ink dark:bg-paper-700 dark:text-paper-100"
              >
                Next
              </button>
            </div>
          </div>

          {/* Items in Current Category */}
          <div className="space-y-4">
            {itemsInCurrentCategory.map((item) => {
              const entry = itemEntries[item.id] || {
                checklistItemId: item.id,
                conditionRating: 5,
                notes: '',
                photos: [],
              };

              return (
                <div
                  key={item.id}
                  className="border-2 border-ink dark:border-paper-400 bg-paper-100 dark:bg-paper-900 p-5 shadow-paper space-y-4 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-paper-300 dark:border-paper-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-paper-200 dark:bg-paper-800 border border-paper-400 font-bold text-ink dark:text-paper-100">
                          {item.code}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-light dark:text-paper-400 mt-1">
                        <strong>Check for:</strong> {item.damageHint}
                      </p>
                    </div>

                    <div className="text-right sm:flex-shrink-0">
                      <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
                        Typical Repair Cost
                      </span>
                      <span className="font-mono text-sm font-bold text-ink dark:text-paper-100">
                        ₹{item.typicalRepairCostInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* 1 to 5 Condition Segmented Rating */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1.5">
                      Condition Rating:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
                      {[
                        { r: 1, label: 'Damaged' },
                        { r: 2, label: 'Poor' },
                        { r: 3, label: 'Fair' },
                        { r: 4, label: 'Good' },
                        { r: 5, label: 'Like New' },
                      ].map(({ r, label }) => {
                        const isSelected = entry.conditionRating === r;
                        const ratingColor =
                          r <= 2
                            ? 'bg-vermilion-600 text-paper-100 border-vermilion-600'
                            : r === 3
                            ? 'bg-mustard-600 text-paper-100 border-mustard-600'
                            : 'bg-forest-600 text-paper-100 border-forest-600';

                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleRatingChange(item.id, r)}
                            className={`py-2 px-1 border-2 font-mono text-xs transition-all ${
                              isSelected
                                ? `${ratingColor} font-bold shadow-paper`
                                : 'border-paper-400 bg-paper-50 dark:bg-paper-800 text-ink dark:text-paper-300 hover:bg-paper-200'
                            }`}
                          >
                            <span className="block text-sm font-bold">{r}</span>
                            <span className="text-[9px] truncate block">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes & Pre-existing tag */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200 mb-1">
                      Observations & Defects:
                    </label>
                    <input
                      type="text"
                      value={entry.notes}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      onBlur={() => triggerAutoSave(item.id, entry.conditionRating, entry.notes)}
                      placeholder="e.g. Scuff marks behind the door, hair crack on left tile, switch loose..."
                      className="w-full px-3 py-2 text-xs border border-paper-400 bg-white dark:bg-paper-800 text-ink dark:text-paper-100 font-sans focus:outline-none focus:border-ink"
                    />
                    {entry.conditionRating <= 2 && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-vermilion-600 dark:text-vermilion-400 font-bold">
                        ★ Marked as Pre-existing wear. You cannot be charged for this at move-out!
                      </span>
                    )}
                  </div>

                  {/* Photo Proof Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-semibold uppercase text-ink dark:text-paper-200">
                        Evidence Photos ({entry.photos.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => triggerCamera(item.id)}
                        disabled={uploadingItem === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono text-xs font-bold hover:opacity-90"
                      >
                        <CameraIcon className="w-3.5 h-3.5" />
                        <span>{uploadingItem === item.id ? 'Sealing...' : 'Capture Photo'}</span>
                      </button>
                    </div>

                    {entry.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        {entry.photos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            className="border border-paper-400 bg-paper-200 dark:bg-paper-800 p-1.5 rounded-sm space-y-1"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.fileUrl}
                              alt={item.name}
                              className="w-full h-24 object-cover border border-paper-400 rounded-sm"
                            />
                            <div className="text-[9px] font-mono text-ink-light dark:text-paper-400 truncate">
                              SHA: {photo.sha256Hash?.substring(0, 10)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 flex items-center justify-between border-t border-paper-400">
            <button
              type="button"
              disabled={currentCategoryIndex === 0}
              onClick={() => {
                setCurrentCategoryIndex((prev) => Math.max(0, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-mono border-2 border-ink disabled:opacity-30 bg-paper-100 dark:bg-paper-800 text-ink dark:text-paper-100"
            >
              ← Previous Category
            </button>

            {currentCategoryIndex < CATEGORIES.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentCategoryIndex((prev) => Math.min(CATEGORIES.length - 1, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90"
              >
                Next Category →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLockModal(true)}
                className="px-6 py-2.5 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-forest-700 shadow"
              >
                Review & Seal Certificate →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seal & Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full border-4 border-ink bg-paper-100 dark:bg-paper-900 p-6 shadow-paper-lg space-y-4">
            <div className="flex items-center justify-between border-b border-paper-400 pb-3">
              <div className="flex items-center gap-2">
                <LockIcon className="w-5 h-5 text-forest-600" />
                <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
                  Seal & Lock Report Permanently
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="text-xs font-mono text-ink-light hover:text-ink"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-light dark:text-paper-300 leading-relaxed">
              Once you lock this report, DepositLocker will compute the <strong>SHA-256 Merkle chain</strong> combining all photo fingerprints and item ratings. The certificate becomes <strong>immutable</strong> and legal-ready.
            </p>

            <div className="border border-paper-400 p-3 bg-paper-200 dark:bg-paper-800 text-xs font-mono space-y-1">
              <div>
                Property: <strong>{room.title}</strong>
              </div>
              <div>
                Report Number: <strong>{report?.reportNumber}</strong>
              </div>
              <div>
                Items Inspected: <strong>{inspectedCount} of {totalItemsCount}</strong>
              </div>
            </div>

            <SignaturePad
              signerName={tenantSignature}
              onSave={(sig) => setTenantSignature(sig)}
              label="Tenant Digital Attestation Signature"
            />

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 border border-paper-400 text-xs font-mono text-ink-light dark:text-paper-300"
              >
                Back to Editing
              </button>

              <button
                type="button"
                disabled={locking || lockedSuccess}
                onClick={handleSealAndLock}
                className="px-6 py-2.5 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-forest-700 shadow disabled:opacity-50"
              >
                {locking ? 'Anchoring SHA-256...' : lockedSuccess ? 'Locked & Sealed!' : 'Stamp & Lock Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
