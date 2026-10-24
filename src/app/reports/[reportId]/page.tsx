'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  SealIcon,
  DocumentIcon,
  QrCodeIcon,
  LockIcon,
  CheckIcon,
  ArrowLeftIcon,
  ShareIcon,
} from '@/components/SvgIcons';
import { StatusStamp } from '@/components/StatusStamp';
import QRCode from 'qrcode';

export default function ReportCertificatePage({ params }: { params: { reportId: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${params.reportId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report);
          const verifyUrl = `${window.location.origin}/reports/${data.report.id}/verify`;
          QRCode.toDataURL(verifyUrl, { width: 220, margin: 1 }).then(setQrCodeUrl);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.reportId]);

  if (loading || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Inspection Certificate...
      </div>
    );
  }

  const room = report.room;
  const isLocked = report.status === 'LOCKED';
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/landlord/${report.shareToken}`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link
          href={`/rooms/${room.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Return to Room Ledger</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/reports/${report.id}/verify`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-forest-600 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-300 font-mono text-xs font-bold hover:bg-forest-100"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Verify SHA-256 Chain</span>
          </Link>

          <a
            href={`/api/reports/${report.id}/pdf`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper-100 dark:bg-paper-100 dark:text-ink font-mono text-xs font-bold hover:opacity-90"
          >
            <DocumentIcon className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-paper-400 bg-paper-200 dark:bg-paper-800 text-ink dark:text-paper-100 font-mono text-xs font-bold hover:bg-paper-300"
          >
            <QrCodeIcon className="w-3.5 h-3.5" />
            <span>Share QR</span>
          </button>
        </div>
      </div>

      {/* Official Notary Certificate Card */}
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-10 shadow-paper-lg space-y-6 relative">
        {/* Notary Seal Watermark */}
        <div className="absolute top-8 right-8 hidden sm:block">
          <StatusStamp type={isLocked ? 'LOCKED' : 'VERIFIED'} size="lg" animate={true} />
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-ink dark:border-paper-400 pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <SealIcon className="w-6 h-6 text-forest-600" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-forest-600">
              OFFICIAL INSPECTION RECORD & EVIDENCE CERTIFICATE
            </span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink dark:text-paper-100">
            {report.type === 'MOVE_IN' ? 'Move-In Condition Certificate' : 'Move-Out Vacating Audit'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-light dark:text-paper-400 pt-1">
            <div>
              REPORT NUMBER: <strong className="text-ink dark:text-paper-100">{report.reportNumber}</strong>
            </div>
            <div>•</div>
            <div>
              SEALED DATE:{' '}
              <strong className="text-ink dark:text-paper-100">
                {report.lockedAt ? new Date(report.lockedAt).toLocaleDateString('en-IN') : 'UNSEALED DRAFT'}
              </strong>
            </div>
            <div>•</div>
            <div>
              MODEL TENANCY ACT:{' '}
              <span className="text-forest-600 font-bold">SECTION 11 COMPLIANT</span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Merkle Chain Banner */}
        <div className="border-2 border-forest-600 bg-forest-50/70 dark:bg-forest-950/40 p-4 rounded-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-300 font-bold">
              CRYPTOGRAPHIC SHA-256 CHAINED HASH (TAMPER-EVIDENT ROOT)
            </span>
            <span className="text-[10px] font-mono text-forest-600 font-semibold">
              IMMUTABLE RECORD
            </span>
          </div>
          <div className="font-mono text-xs sm:text-sm text-ink dark:text-paper-100 font-bold break-all bg-white dark:bg-paper-900 p-2.5 border border-forest-600/40">
            {report.chainedHash || 'DRAFT_REPORT_NOT_YET_CRYPTOGRAPHICALLY_SEALED'}
          </div>
          <p className="text-[11px] font-mono text-ink-light dark:text-paper-400">
            This root digest represents the recursive mathematical hash of all {report.items?.length || 0} items and their respective photo fingerprints. Any alteration to even one byte of evidence invalidates this hash.
          </p>
        </div>

        {/* Tenancy & Property Particulars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800/60 font-mono text-xs space-y-2 md:space-y-0">
          <div className="space-y-1.5">
            <div>
              Property: <strong>{room.title} ({room.propertyType})</strong>
            </div>
            <div>
              Address: <strong>{room.address}, {room.area}</strong>
            </div>
            <div>
              Tenant: <strong>{room.user.name} ({room.user.email})</strong>
            </div>
          </div>

          <div className="space-y-1.5 md:border-l md:border-paper-300 md:pl-4">
            <div>
              Landlord: <strong>{room.landlordName} ({room.landlordPhone})</strong>
            </div>
            <div>
              Security Deposit: <strong>₹{room.securityDeposit.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              Monthly Rent: <strong>₹{room.monthlyRent.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Table of Inspected Items */}
        <div className="space-y-3">
          <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
            Condition Ledger & Evidence Audit ({report.items?.length || 0} Items)
          </h3>

          <div className="border-2 border-ink dark:border-paper-400 overflow-x-auto shadow-paper">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b-2 border-ink bg-paper-200 dark:bg-paper-800 font-mono text-[11px] uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Checklist Item</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SHA-256 Photo Fingerprint</th>
                  <th className="p-3">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-300 dark:divide-paper-800">
                {report.items?.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-paper-200/50 dark:hover:bg-paper-800/50">
                    <td className="p-3 font-mono text-ink-light">{idx + 1}</td>
                    <td className="p-3 font-mono text-[11px] uppercase">{item.checklistItem.category}</td>
                    <td className="p-3 font-serif font-bold text-sm text-ink dark:text-paper-100">
                      {item.checklistItem.name}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {item.conditionRating}/5
                    </td>
                    <td className="p-3">
                      <StatusStamp type={item.status} size="sm" />
                    </td>
                    <td className="p-3 font-mono text-[10px] text-forest-600 truncate max-w-[120px]">
                      {item.photos?.[0]?.sha256Hash
                        ? `${item.photos[0].sha256Hash.substring(0, 14)}...`
                        : 'NO PHOTO'}
                    </td>
                    <td className="p-3 text-[11px] text-ink-light max-w-xs">
                      {item.notes || 'Clean, functional, no defects recorded.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Attestations Section */}
        <div className="pt-6 border-t-2 border-ink dark:border-paper-400 space-y-4">
          <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
            Digital Attestation & Signatures
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Signature */}
            <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light">
                Tenant Signature
              </span>
              <div className="font-serif italic text-2xl text-ink dark:text-paper-100 py-1">
                {report.tenantSignature || room.user.name}
              </div>
              <div className="text-[10px] font-mono text-ink-light">
                Timestamp: {report.lockedAt ? new Date(report.lockedAt).toLocaleString('en-IN') : 'Pending'}
              </div>
            </div>

            {/* Landlord Acknowledgment */}
            <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light">
                Landlord Acknowledgment
              </span>
              <div className="font-serif italic text-2xl text-ink dark:text-paper-100 py-1">
                {report.landlordSignature || `${room.landlordName} (Acknowledged via Link)`}
              </div>
              <div className="text-[10px] font-mono text-forest-600 font-bold">
                Status: {report.landlordStatus === 'ACKNOWLEDGED' ? '✓ Digitally Acknowledged' : 'Pending Review'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full border-4 border-ink bg-paper-100 dark:bg-paper-900 p-6 shadow-paper-lg space-y-4 text-center">
            <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
              Scan to Inspect Certificate
            </h3>
            <p className="text-xs text-ink-light">
              Official read-only link for Landlord verification without login.
            </p>

            {qrCodeUrl && (
              <div className="p-3 bg-white border border-paper-400 inline-block rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Inspection QR" className="w-48 h-48 mx-auto" />
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-2.5 py-1 text-xs font-mono border border-paper-400 bg-paper-50 dark:bg-paper-800"
              />
              <button
                type="button"
                onClick={copyShare}
                className="px-3 py-1 bg-ink text-paper-100 text-xs font-mono font-bold"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="text-xs font-mono text-ink-light underline block mx-auto pt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
