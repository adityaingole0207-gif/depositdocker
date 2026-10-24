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
  ScalesIcon,
} from '@/components/SvgIcons';
import { ProgressRing } from '@/components/ProgressRing';
import { StatusStamp } from '@/components/StatusStamp';
import { SignaturePad } from '@/components/SignaturePad';

interface MoveInItemMap {
  checklistItemId: string;
  conditionRating: number;
  notes: string;
  photos: Array<{ fileUrl: string; sha256Hash: string }>;
}

export default function MoveOutWalkthroughPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [moveInReport, setMoveInReport] = useState<any>(null);
  const [moveOutReport, setMoveOutReport] = useState<any>(null);
  const [allChecklist, setAllChecklist] = useState<any[]>([]);
  const [moveInItems, setMoveInItems] = useState<Record<string, MoveInItemMap>>({});
  const [itemEntries, setItemEntries] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [locking, setLocking] = useState(false);
  const [tenantSignature, setTenantSignature] = useState('Verified Tenant');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeItemIdForPhoto = useRef<string | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          const inRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_IN');
          let outRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_OUT');

          setMoveInReport(inRpt);
          setMoveOutReport(outRpt);

          // Build map of move-in items for side-by-side reference
          const inMap: Record<string, MoveInItemMap> = {};
          if (inRpt && inRpt.items) {
            inRpt.items.forEach((it: any) => {
              inMap[it.checklistItemId] = {
                checklistItemId: it.checklistItemId,
                conditionRating: it.conditionRating,
                notes: it.notes || '',
                photos: it.photos || [],
              };
            });
          }
          setMoveInItems(inMap);

          // Populate move-out items if existing
          const initialOutMap: Record<string, any> = {};
          if (outRpt && outRpt.items) {
            outRpt.items.forEach((it: any) => {
              initialOutMap[it.checklistItemId] = {
                checklistItemId: it.checklistItemId,
                conditionRating: it.conditionRating,
                notes: it.notes || '',
                photos: it.photos || [],
              };
            });
          }
          setItemEntries(initialOutMap);
        }
        if (data.checklistItems) {
          setAllChecklist(data.checklistItems);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Ensure move out report exists on server
  const ensureMoveOutReport = async () => {
    if (moveOutReport) return moveOutReport;
    const count = room?.reports?.length || 1;
    const areaPrefix = (room?.area || 'PUN').substring(0, 3).toUpperCase();
    const reportNumber = `DL-OUT-${areaPrefix}-${new Date().getFullYear()}-${String(count + 200).padStart(4, '0')}`;

    // Create report via API or use existing
    const res = await fetch(`/api/reports/${moveInReport.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return moveOutReport;
  };

  const handleRatingChange = (itemId: string, rating: number) => {
    setItemEntries((prev) => ({
      ...prev,
      [itemId]: {
        checklistItemId: itemId,
        conditionRating: rating,
        notes: prev[itemId]?.notes || '',
        photos: prev[itemId]?.photos || [],
      },
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setItemEntries((prev) => ({
      ...prev,
      [itemId]: {
        checklistItemId: itemId,
        conditionRating: prev[itemId]?.conditionRating || 5,
        notes,
        photos: prev[itemId]?.photos || [],
      },
    }));
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
    if (!file || !itemId) return;

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

      setItemEntries((prev) => ({
        ...prev,
        [itemId]: {
          checklistItemId: itemId,
          conditionRating: prev[itemId]?.conditionRating || 5,
          notes: prev[itemId]?.notes || '',
          photos: newPhotos,
        },
      }));
    } catch (err) {
      console.error(err);
      alert('Photo upload failed.');
    } finally {
      setUploadingItem(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLockAndCompare = async () => {
    setLocking(true);
    try {
      if (moveOutReport) {
        await fetch(`/api/reports/${moveOutReport.id}/lock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantSignature }),
        });
      }
      router.push(`/rooms/${room.id}/compare`);
    } catch (err) {
      console.error(err);
      alert('Error finalizing move-out report');
    } finally {
      setLocking(false);
    }
  };

  const inspectedCount = Object.keys(itemEntries).length;
  const totalCount = allChecklist.length || 40;
  const progressPercent = (inspectedCount / totalCount) * 100;

  if (loading || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Move-out Inspection Ledger...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />

      {/* Header */}
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
              Move-Out Vacating Inspection
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-vermilion-600 text-vermilion-600 font-bold">
              SIDE-BY-SIDE PROOF
            </span>
          </div>
          <p className="text-xs text-ink-light dark:text-paper-300">
            {room.title} • Showing Move-In reference photo for each item to safeguard against unfair charges.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <ProgressRing progress={progressPercent} size={48} strokeWidth={5} />
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-ink dark:text-paper-100">
                {inspectedCount} of {totalCount}
              </span>
              <span className="block text-[10px] font-mono text-ink-light dark:text-paper-400">
                Vacate Items Checked
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLockModal(true)}
            className="px-4 py-2.5 bg-vermilion-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-vermilion-700 shadow flex items-center gap-1.5"
          >
            <ScalesIcon className="w-4 h-4" />
            <span>Run Comparison Diff</span>
          </button>
        </div>
      </div>

      {/* Inspection Cards with Side-by-Side Reference */}
      <div className="space-y-6">
        {allChecklist.slice(0, 15).map((item) => {
          const moveInInfo = moveInItems[item.id];
          const entry = itemEntries[item.id] || {
            conditionRating: moveInInfo ? moveInInfo.conditionRating : 5,
            notes: '',
            photos: [],
          };

          const isPreExisting = moveInInfo && moveInInfo.conditionRating <= 2;

          return (
            <div
              key={item.id}
              className="border-2 border-ink dark:border-paper-400 bg-paper-100 dark:bg-paper-900 p-5 shadow-paper space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-300 dark:border-paper-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-paper-200 dark:bg-paper-800 border border-paper-400 font-bold">
                    {item.code}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-ink-light uppercase">
                    ({item.category})
                  </span>
                </div>

                {isPreExisting && (
                  <span className="inline-block px-2 py-0.5 border border-mustard-600 text-mustard-600 font-mono text-[10px] font-bold">
                    PRE-EXISTING MOVE-IN DEFECT (₹0 LIABILITY)
                  </span>
                )}
              </div>

              {/* Side-by-Side Inspection Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Move-in Baseline Proof */}
                <div className="border border-paper-400 bg-paper-50 dark:bg-paper-800/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-forest-600 uppercase">
                      1. Move-In Baseline Reference
                    </span>
                    <span className="font-mono text-xs font-bold text-ink dark:text-paper-100">
                      Rating: {moveInInfo ? `${moveInInfo.conditionRating}/5` : 'Not recorded'}
                    </span>
                  </div>

                  {moveInInfo?.photos && moveInInfo.photos.length > 0 ? (
                    <div className="space-y-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={moveInInfo.photos[0].fileUrl}
                        alt="Move in baseline"
                        className="w-full h-44 object-cover border border-paper-400 rounded-sm"
                      />
                      <div className="text-[9px] font-mono text-ink-light dark:text-paper-400 truncate">
                        SHA-256: {moveInInfo.photos[0].sha256Hash.substring(0, 20)}...
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 border border-dashed border-paper-400 flex items-center justify-center font-mono text-xs text-ink-light">
                      No move-in photo attached
                    </div>
                  )}

                  <p className="text-xs text-ink-light italic">
                    {moveInInfo?.notes || 'No defects recorded at lease signing.'}
                  </p>
                </div>

                {/* Right Column: Move-Out Vacating Capture */}
                <div className="border border-paper-400 bg-paper-50 dark:bg-paper-800/60 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-vermilion-600 uppercase">
                      2. Move-Out Vacate Status
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerCamera(item.id)}
                      disabled={uploadingItem === item.id}
                      className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 bg-ink text-paper-100 hover:opacity-90"
                    >
                      <CameraIcon className="w-3.5 h-3.5" />
                      <span>{uploadingItem === item.id ? 'Sealing...' : 'Capture Vacate Photo'}</span>
                    </button>
                  </div>

                  {/* Rating Selector */}
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRatingChange(item.id, r)}
                        className={`py-1.5 font-mono text-xs border ${
                          entry.conditionRating === r
                            ? 'bg-ink text-paper-100 font-bold'
                            : 'border-paper-400 bg-paper-100 text-ink'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Note changes since move-in..."
                    className="w-full px-2.5 py-1.5 text-xs border border-paper-400 bg-white dark:bg-paper-900 text-ink dark:text-paper-100"
                  />

                  {entry.photos && entry.photos.length > 0 && (
                    <div className="flex gap-2">
                      {entry.photos.map((p: any, idx: number) => (
                        <div key={idx} className="w-20 h-20 border border-paper-400">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.fileUrl}
                            alt="Vacate photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-2 border-ink bg-paper-200 dark:bg-paper-800 text-center space-y-3">
        <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
          Ready to Compare Handover Condition?
        </h3>
        <p className="text-xs text-ink-light dark:text-paper-300 max-w-lg mx-auto">
          The Comparison Engine will automatically calculate normal wear & tear, pre-existing waivers, and fair depreciated deductions.
        </p>
        <Link
          href={`/rooms/${room.id}/compare`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-forest-700 shadow"
        >
          <ScalesIcon className="w-4 h-4" />
          <span>Launch Move-In vs Move-Out Comparison →</span>
        </Link>
      </div>

      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full border-4 border-ink bg-paper-100 dark:bg-paper-900 p-6 shadow-paper-lg space-y-4">
            <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
              Attest Move-Out Inspection
            </h3>
            <p className="text-xs text-ink-light leading-relaxed">
              Sign to freeze the vacating inspection record. Both reports will be merged into the automated diff ledger.
            </p>
            <SignaturePad
              signerName={tenantSignature}
              onSave={(sig) => setTenantSignature(sig)}
              label="Tenant Digital Attestation"
            />
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="px-3 py-1.5 border border-paper-400 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={locking}
                onClick={handleLockAndCompare}
                className="px-5 py-2 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase"
              >
                {locking ? 'Locking...' : 'Lock & Run Diff Engine →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
