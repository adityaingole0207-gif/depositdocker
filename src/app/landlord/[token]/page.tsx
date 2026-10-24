'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  CheckIcon,
  AlertIcon,
  DocumentIcon,
  SealIcon,
} from '@/components/SvgIcons';
import { StatusStamp } from '@/components/StatusStamp';
import { SignaturePad } from '@/components/SignaturePad';

export default function LandlordViewPage({ params }: { params: { token: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Acknowledgment fields
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [landlordNotes, setLandlordNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // Item disputes
  const [disputedItems, setDisputedItems] = useState<Record<string, string>>({});
  const [disputingItemId, setDisputingItemId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    fetch(`/api/landlord/${params.token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data.report);
        if (data.report.room?.landlordName) {
          setLandlordName(data.report.room.landlordName);
        }
        if (data.report.room?.landlordPhone) {
          setLandlordPhone(data.report.room.landlordPhone);
        }
        if (data.report.landlordStatus === 'ACKNOWLEDGED') {
          setAcknowledged(true);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/landlord/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACKNOWLEDGE',
          landlordName,
          landlordPhone,
          landlordNotes,
          landlordSignature: signature || landlordName,
        }),
      });

      if (!res.ok) throw new Error('Failed to record acknowledgment');
      setAcknowledged(true);
      alert('Your digital acknowledgment has been cryptographically recorded.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error recording acknowledgment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDisputeComment = async (itemId: string) => {
    if (!commentInput) return;
    try {
      await fetch(`/api/landlord/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPUTE_ITEMS',
          disputedItems: [{ itemId, comment: commentInput }],
        }),
      });

      setDisputedItems((prev) => ({ ...prev, [itemId]: commentInput }));
      setDisputingItemId(null);
      setCommentInput('');
      alert('Your item observation has been recorded.');
    } catch (err) {
      console.error(err);
      alert('Error recording observation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Landlord Inspection Portal...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertIcon className="w-8 h-8 text-vermilion-600 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-ink">Invalid Verification Link</h2>
        <p className="text-xs font-mono text-ink-light">
          {error || 'This link may have expired or is incorrect.'}
        </p>
      </div>
    );
  }

  const room = report.room;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Landlord Portal Header */}
      <div className="border-4 border-ink bg-paper-100 p-6 sm:p-8 shadow-paper-lg space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold border-b border-paper-400 pb-2">
          <SealIcon className="w-4 h-4" />
          <span>PROPERTY OWNER & LANDLORD VERIFICATION REGISTRY</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
              Tenancy Condition Inspection Certificate
            </h1>
            <p className="text-xs text-ink-light mt-1">
              {room.title} ({room.area}) • Tenant: <strong>{room.user.name}</strong>
            </p>
          </div>

          <StatusStamp
            type={acknowledged ? 'SETTLED' : report.status === 'LOCKED' ? 'LOCKED' : 'VERIFIED'}
            size="md"
          />
        </div>

        <p className="text-xs text-ink-light leading-relaxed">
          Your tenant has sealed the condition walkthrough using DepositLocker. Below are the timestamped photos and checklist ratings taken on premises. Review the ledger and provide your digital acknowledgment or comments.
        </p>

        {/* Tenancy Particulars Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-paper-200 border border-paper-400 font-mono text-xs">
          <div>
            <span className="text-ink-light text-[10px] block">SECURITY DEPOSIT</span>
            <strong className="text-ink">₹{room.securityDeposit.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="text-ink-light text-[10px] block">MONTHLY RENT</span>
            <strong className="text-ink">₹{room.monthlyRent.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="text-ink-light text-[10px] block">REPORT NUMBER</span>
            <strong className="text-forest-600">{report.reportNumber}</strong>
          </div>
          <div>
            <span className="text-ink-light text-[10px] block">AUDIT STATUS</span>
            <strong className="text-ink">
              {acknowledged ? 'Acknowledged' : 'Pending Landlord Sign'}
            </strong>
          </div>
        </div>
      </div>

      {/* Items List with Dispute / Commenting Ability */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-black text-xl text-ink">
            Inspected Items ({report.items?.length || 0})
          </h2>
          <span className="text-xs font-mono text-ink-light">
            Click Flag on any item to submit a landlord observation
          </span>
        </div>

        <div className="space-y-4">
          {report.items?.map((item: any, idx: number) => {
            const hasComment = item.landlordComment || disputedItems[item.id];
            const isEditingComment = disputingItemId === item.id;

            return (
              <div
                key={item.id}
                className="border-2 border-ink bg-paper-100 p-5 shadow-paper space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 bg-paper-200 border border-paper-400 font-bold">
                      #{idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-base text-ink">
                      {item.checklistItem.name}
                    </h3>
                    <span className="text-[10px] font-mono text-ink-light uppercase">
                      ({item.checklistItem.category})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-paper-200 border border-paper-400">
                      Rating: {item.conditionRating}/5
                    </span>
                    <StatusStamp type={item.status} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-ink-light italic">
                  Tenant remarks: {item.notes || 'No issues noted during walkthrough.'}
                </p>

                {/* Evidence Photos */}
                {item.photos?.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {item.photos.map((p: any, pIdx: number) => (
                      <div key={pIdx} className="space-y-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.fileUrl}
                          alt={item.checklistItem.name}
                          className="w-36 h-28 object-cover border border-paper-400 rounded-sm"
                        />
                        <div className="text-[9px] font-mono text-ink-light truncate w-36">
                          SHA: {p.sha256Hash?.substring(0, 14)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Landlord dispute feedback */}
                {hasComment && (
                  <div className="p-2.5 bg-mustard-50 border border-mustard-500 text-xs font-mono text-mustard-900">
                    <strong>Your Landlord Observation:</strong> {hasComment}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  {!isEditingComment ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDisputingItemId(item.id);
                        setCommentInput(hasComment || '');
                      }}
                      className="text-xs font-mono text-ink-light underline hover:text-ink"
                    >
                      {hasComment ? 'Edit Observation' : '+ Add Landlord Comment on this Item'}
                    </button>
                  ) : (
                    <div className="w-full space-y-2 pt-2 border-t border-paper-300">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="e.g. Please clean this area before moving out, or agree on pre-existing scratch."
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-paper-400 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveDisputeComment(item.id)}
                          className="px-3 py-1 bg-ink text-paper-100 text-xs font-mono font-bold"
                        >
                          Save Comment
                        </button>
                        <button
                          type="button"
                          onClick={() => setDisputingItemId(null)}
                          className="px-3 py-1 border border-paper-400 text-xs font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Landlord Acknowledgment Form */}
      <div className="border-4 border-ink bg-paper-100 p-6 sm:p-8 shadow-paper-lg space-y-4">
        <h2 className="font-serif font-black text-2xl text-ink">
          Landlord Digital Acknowledgment
        </h2>
        <p className="text-xs text-ink-light leading-relaxed">
          By signing below, you acknowledge having reviewed the move-in inspection photographs and ratings.
          This establishes a mutual baseline so deposit settlement at lease conclusion is swift and dispute-free.
        </p>

        {acknowledged ? (
          <div className="p-4 bg-forest-50 border-2 border-forest-600 text-forest-900 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <CheckIcon className="w-5 h-5 text-forest-600" />
              <span>Inspection Certificate Acknowledged & Signed</span>
            </div>
            <p className="text-xs font-mono text-forest-800">
              Acknowledged by: <strong>{report.landlordName}</strong> ({report.landlordPhone}) on{' '}
              {report.landlordAcknowledgedAt
                ? new Date(report.landlordAcknowledgedAt).toLocaleDateString('en-IN')
                : new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleAcknowledge} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink mb-1">
                  Landlord / Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink bg-white font-sans focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-ink mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={landlordPhone}
                  onChange={(e) => setLandlordPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-ink bg-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-ink mb-1">
                Optional Notes / Agreed Exceptions
              </label>
              <textarea
                rows={2}
                value={landlordNotes}
                onChange={(e) => setLandlordNotes(e.target.value)}
                placeholder="e.g. Geyser switch replacement is scheduled next week at owner cost..."
                className="w-full px-3 py-2 text-sm border-2 border-ink bg-white font-sans focus:outline-none"
              />
            </div>

            <SignaturePad
              signerName={landlordName}
              onSave={(sig) => setSignature(sig)}
              label="Landlord Attestation Signature (Draw or Type)"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-forest-600 text-paper-100 font-mono font-bold text-xs uppercase tracking-widest hover:bg-forest-700 shadow"
            >
              {submitting ? 'Anchoring Signature...' : 'Sign & Acknowledge Move-In Certificate'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
