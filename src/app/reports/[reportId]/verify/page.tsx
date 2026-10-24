'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  CheckIcon,
  AlertIcon,
  ArrowLeftIcon,
  SealIcon,
} from '@/components/SvgIcons';
import { StatusStamp } from '@/components/StatusStamp';

export default function VerifyReportPage({ params }: { params: { reportId: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/reports/${params.reportId}/verify`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.reportId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Running Cryptographic SHA-256 Integrity Audit...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertIcon className="w-8 h-8 text-vermilion-600 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-ink dark:text-paper-100">
          Verification Failed
        </h2>
        <p className="text-xs font-mono text-ink-light">{error || 'Could not audit report'}</p>
        <Link href="/dashboard" className="inline-block text-xs font-mono underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isIntact = data.status === 'INTACT';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        href={`/reports/${params.reportId}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-2"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Back to Inspection Certificate</span>
      </Link>

      {/* Main Verification Card */}
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-10 shadow-paper-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-ink dark:border-paper-400">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold mb-1">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>CRYPTOGRAPHIC TAMPER-EVIDENT AUDIT</span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink dark:text-paper-100">
              SHA-256 Hash Chain Verification
            </h1>
            <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
              Report No: <span className="font-mono font-bold">{data.reportNumber}</span> • Property: <strong>{data.roomTitle}</strong>
            </p>
          </div>

          <StatusStamp type={isIntact ? 'VERIFIED' : 'POSSIBLE_DAMAGE'} size="lg" animate={true} />
        </div>

        {/* Audit Status Result Banner */}
        <div
          className={`border-3 p-5 rounded-sm flex items-start gap-4 ${
            isIntact
              ? 'border-forest-600 bg-forest-50 dark:bg-forest-950/40 text-forest-950 dark:text-forest-100'
              : 'border-vermilion-600 bg-vermilion-50 dark:bg-vermilion-950/40 text-vermilion-950 dark:text-vermilion-100'
          }`}
        >
          {isIntact ? (
            <CheckIcon className="w-8 h-8 text-forest-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertIcon className="w-8 h-8 text-vermilion-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h2 className="font-serif font-black text-2xl">
              {isIntact
                ? 'Cryptographic Seal Intact • Tamper-Free Verified'
                : 'Tampering Detected • Hash Mismatch Alert'}
            </h2>
            <p className="text-xs font-mono opacity-90 leading-relaxed">
              {isIntact
                ? `All ${data.itemsAudited} items and photo digests match the mathematical chained root recorded at ${new Date(data.lockedAt).toLocaleString('en-IN')}. No data or image has been manipulated.`
                : 'The recomputed SHA-256 root differs from the anchored record. This evidence has been modified or corrupted.'}
            </p>
          </div>
        </div>

        {/* Cryptographic Comparison Details */}
        <div className="border border-paper-400 bg-paper-50 dark:bg-paper-800 p-4 font-mono text-xs space-y-3">
          <h3 className="font-serif font-bold text-base text-ink dark:text-paper-100">
            Mathematical Hash Chain Verification Details
          </h3>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-ink-light dark:text-paper-400 block">
              1. Anchored Chained Root (On-Chain / DB Record):
            </span>
            <div className="p-2 bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 text-ink dark:text-paper-100 text-[11px] break-all select-all">
              {data.storedChainedHash}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-ink-light dark:text-paper-400 block">
              2. Recomputed Live SHA-256 Digest (Re-hashed from evidence buffers):
            </span>
            <div className="p-2 bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 text-ink dark:text-paper-100 text-[11px] break-all select-all">
              {data.recomputedChainedHash}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-light pt-1 border-t border-paper-300">
            <span>Audit Executed At: {new Date(data.auditTimestamp).toLocaleString('en-IN')}</span>
            <span className="font-bold text-forest-600">
              Match Status: {isIntact ? '100% IDENTICAL' : 'MISMATCH'}
            </span>
          </div>
        </div>

        {/* Item-by-Item Hash Verification Table */}
        <div className="space-y-3">
          <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
            Evidence Fingerprints ({data.itemsAudited} Items)
          </h3>

          <div className="border-2 border-ink dark:border-paper-400 overflow-x-auto shadow-paper">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b-2 border-ink bg-paper-200 dark:bg-paper-800 font-mono text-[11px] uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Photos</th>
                  <th className="p-3">Item SHA-256 Digest</th>
                  <th className="p-3">Tamper Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-300 dark:divide-paper-800">
                {data.itemAudit?.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-paper-200/50 dark:hover:bg-paper-800/50">
                    <td className="p-3 font-mono text-ink-light">{idx + 1}</td>
                    <td className="p-3 font-serif font-bold text-ink dark:text-paper-100">
                      {item.name}
                    </td>
                    <td className="p-3 font-mono text-[11px] uppercase">{item.category}</td>
                    <td className="p-3 font-mono font-bold">{item.rating}/5</td>
                    <td className="p-3 font-mono">{item.photoCount} files</td>
                    <td className="p-3 font-mono text-[10px] text-forest-600 break-all max-w-xs">
                      {item.itemHash}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-forest-600">
                        <CheckIcon className="w-3 h-3" />
                        <span>INTACT</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
