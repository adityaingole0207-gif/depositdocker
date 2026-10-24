'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BuildingIcon,
  ShieldCheckIcon,
  DocumentIcon,
  CameraIcon,
  ScalesIcon,
  QrCodeIcon,
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
} from '@/components/SvgIcons';
import { StatusStamp, StampType } from '@/components/StatusStamp';
import QRCode from 'qrcode';

export default function RoomLedgerHubPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          const inReport = data.room.reports?.find((r: any) => r.type === 'MOVE_IN');
          if (inReport) {
            const shareUrl = `${window.location.origin}/landlord/${inReport.shareToken}`;
            QRCode.toDataURL(shareUrl, { width: 200, margin: 1 }).then(setQrCodeDataUrl);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this room record?')) return;
    await fetch(`/api/rooms/${params.id}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  if (loading || !room) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Room Ledger Hub...
      </div>
    );
  }

  const moveInReport = room.reports?.find((r: any) => r.type === 'MOVE_IN');
  const moveOutReport = room.reports?.find((r: any) => r.type === 'MOVE_OUT');
  const landlordShareUrl = moveInReport
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/landlord/${moveInReport.shareToken}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(landlordShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Ledger Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/rooms/${room.id}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-paper-400 bg-paper-100 hover:bg-paper-200 text-ink dark:bg-paper-800 dark:text-paper-100"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Edit Room</span>
          </Link>
          <button
            type="button"
            onClick={handleArchive}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-vermilion-500 text-vermilion-600 hover:bg-vermilion-50"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Certificate Card */}
      <div className="luxury-card rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-200 dark:border-paper-800">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium mb-1">
              <span>DOSSIER • {room.area} ({room.city})</span>
            </div>
            <h1 className="font-serif font-medium text-3xl sm:text-4xl text-ink dark:text-paper-100 tracking-tight">
              {room.title}
            </h1>
            <p className="text-xs text-ink-light dark:text-paper-400 mt-1 font-sans">
              {room.address} • Pincode: {room.pincode}
            </p>
          </div>

          <StatusStamp type={room.status as StampType} size="lg" />
        </div>

        {/* Tenancy & Financial Particulars Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Security Deposit
            </span>
            <div className="font-serif text-2xl font-medium text-ink dark:text-paper-100 tabular-nums">
              ₹{room.securityDeposit.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Monthly Rent
            </span>
            <div className="font-serif text-2xl font-medium text-ink dark:text-paper-100 tabular-nums">
              ₹{room.monthlyRent.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Lease Term
            </span>
            <div className="font-mono text-xs font-semibold text-ink dark:text-paper-100 mt-1">
              {new Date(room.leaseStartDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} to{' '}
              {new Date(room.leaseEndDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Landlord Contact
            </span>
            <div className="font-sans text-xs font-bold text-ink dark:text-paper-100 mt-0.5">
              {room.landlordName}
            </div>
            <div className="font-mono text-[11px] text-ink-light dark:text-paper-400">
              {room.landlordPhone}
            </div>
          </div>
        </div>

        {/* Audit Pipeline Milestones */}
        <div className="space-y-4 pt-4 border-t border-paper-200 dark:border-paper-800">
          <h2 className="font-serif font-medium text-2xl text-ink dark:text-paper-100">
            Deposit Protection Pipeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Move-in Report Card */}
            <div className="luxury-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-forest-700 dark:text-forest-400" />
                  <span className="font-serif font-medium text-lg text-ink dark:text-paper-100">
                    Move-In Certificate
                  </span>
                </div>
                {moveInReport?.status === 'LOCKED' ? (
                  <StatusStamp type="LOCKED" size="sm" />
                ) : (
                  <span className="text-xs font-mono text-mustard-600 font-bold">DRAFT</span>
                )}
              </div>

              {moveInReport ? (
                <div className="space-y-2 text-xs font-mono text-ink-light dark:text-paper-300">
                  <div className="flex justify-between">
                    <span>Certificate No:</span>
                    <strong className="text-ink dark:text-paper-100">{moveInReport.reportNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{moveInReport.status === 'LOCKED' ? 'Sealed & Locked' : 'Pending Lock'}</span>
                  </div>
                  {moveInReport.chainedHash && (
                    <div className="truncate text-[10px]">
                      Hash: <span className="text-forest-600">{moveInReport.chainedHash.substring(0, 24)}...</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/reports/${moveInReport.id}`}
                      className="px-3 py-1.5 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink text-xs font-mono font-bold hover:opacity-90"
                    >
                      View Certificate
                    </Link>
                    <a
                      href={`/api/reports/${moveInReport.id}/pdf`}
                      className="px-3 py-1.5 border border-ink text-xs font-mono font-bold hover:bg-paper-200"
                    >
                      Download PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-1.5 border border-forest-600 text-forest-700 text-xs font-mono font-bold hover:bg-forest-50"
                    >
                      Landlord Share QR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ink-light">
                    No move-in condition audit recorded yet. Document baseline before moving furniture in.
                  </p>
                  <Link
                    href={`/rooms/${room.id}/move-in`}
                    className="inline-block px-4 py-2 bg-forest-600 text-paper-100 text-xs font-mono font-bold uppercase"
                  >
                    Start Move-in Walkthrough →
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Move-out & Diff Card */}
            <div className="border-2 border-ink dark:border-paper-400 bg-paper-50 dark:bg-paper-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScalesIcon className="w-5 h-5 text-vermilion-600" />
                  <span className="font-serif font-bold text-base text-ink dark:text-paper-100">
                    Move-Out Vacate & Diff Engine
                  </span>
                </div>
                {moveOutReport ? (
                  <StatusStamp type="COMPARED" size="sm" />
                ) : (
                  <span className="text-xs font-mono text-ink-light">Awaiting Vacate</span>
                )}
              </div>

              {moveOutReport ? (
                <div className="space-y-2 text-xs font-mono text-ink-light dark:text-paper-300">
                  <div className="flex justify-between">
                    <span>Vacate Audit No:</span>
                    <strong className="text-ink dark:text-paper-100">{moveOutReport.reportNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Status:</span>
                    <strong className="text-forest-600">Comparison Ready</strong>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/rooms/${room.id}/compare`}
                      className="px-3 py-1.5 bg-forest-600 text-paper-100 text-xs font-mono font-bold hover:bg-forest-700"
                    >
                      Open Comparison Diff
                    </Link>
                    <Link
                      href={`/rooms/${room.id}/dispute`}
                      className="px-3 py-1.5 bg-vermilion-600 text-paper-100 text-xs font-mono font-bold hover:bg-vermilion-700"
                    >
                      Dispute Helper
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ink-light">
                    When vacating this room, walk through the same 40-point checklist side-by-side with your original move-in photos.
                  </p>
                  <Link
                    href={`/rooms/${room.id}/move-out`}
                    className="inline-block px-4 py-2 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink text-xs font-mono font-bold uppercase"
                  >
                    Begin Move-Out Walkthrough →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Landlord Share Link & QR Code Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full border-4 border-ink bg-paper-100 dark:bg-paper-900 p-6 shadow-paper-lg space-y-4">
            <div className="flex items-center justify-between border-b border-paper-400 pb-2">
              <h3 className="font-serif font-black text-lg text-ink dark:text-paper-100">
                Landlord Verification Link & QR
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-xs font-mono text-ink-light hover:text-ink"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-light dark:text-paper-300">
              Share this read-only link or let your landlord scan the QR code. They do not need to register to view evidence and digitally acknowledge the report.
            </p>

            {qrCodeDataUrl && (
              <div className="flex justify-center p-3 bg-white border border-paper-400 rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeDataUrl} alt="Landlord share QR" className="w-44 h-44" />
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={landlordShareUrl}
                className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-paper-400 bg-paper-50 dark:bg-paper-800 text-ink dark:text-paper-100"
              />
              <button
                type="button"
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-ink text-paper-100 text-xs font-mono font-bold"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="text-center pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Dear Landlord, please inspect and acknowledge the official move-in condition certificate for ${room.title}: ${landlordShareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-mono text-forest-700 underline font-bold"
              >
                Share directly via WhatsApp →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
