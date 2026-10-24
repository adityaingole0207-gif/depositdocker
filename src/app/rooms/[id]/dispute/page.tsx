'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from '@/components/SvgIcons';
import { DisputeGenerator } from '@/components/DisputeGenerator';
import { calculateFairDeduction } from '@/lib/depreciation';

export default function RoomDisputePage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [fairDeduction, setFairDeduction] = useState(0);

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.room) return;
        setRoom(data.room);

        const inRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_IN');
        const outRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_OUT');

        if (inRpt && outRpt) {
          const list: any[] = [];
          let totalDed = 0;

          inRpt.items.forEach((inIt: any) => {
            const outIt = outRpt.items.find((o: any) => o.checklistItemId === inIt.checklistItemId);
            const inRating = inIt.conditionRating;
            const outRating = outIt ? outIt.conditionRating : inRating;
            const delta = inRating - outRating;

            let status = 'INTACT';
            let cost = 0;

            if (inRating <= 2) {
              status = 'PRE_EXISTING';
            } else if (delta === 1) {
              status = 'NORMAL_WEAR';
            } else if (delta >= 2) {
              status = 'POSSIBLE_DAMAGE';
              const dep = calculateFairDeduction(
                inIt.checklistItem.category,
                inIt.checklistItem.typicalRepairCostInr,
                data.room.leaseStartDate,
                data.room.leaseEndDate
              );
              cost = dep.fairDeduction;
              totalDed += cost;
            }

            list.push({
              name: inIt.checklistItem.name,
              status,
              cost,
              notes: outIt?.notes || inIt?.notes,
            });
          });

          setItemsList(list);
          setFairDeduction(totalDed);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Dispute Notice Registry...
      </div>
    );
  }

  const inReport = room.reports?.find((r: any) => r.type === 'MOVE_IN');
  const reportNumber = inReport?.reportNumber || 'DL-RPT-001';
  const reportVerifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reports/${inReport?.id || room.id}/verify`;
  const recommendedRefund = Math.max(0, room.securityDeposit - fairDeduction);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        href={`/rooms/${room.id}/compare`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-2"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Return to Move-In vs Move-Out Comparison</span>
      </Link>

      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-8 shadow-paper-lg space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block mb-1">
            FORM DL-09 • STATUTORY TENANT DISPUTE & SETTLEMENT ENGINE
          </span>
          <h1 className="font-serif font-black text-3xl text-ink dark:text-paper-100">
            Landlord Communication & Legal Notice Helper
          </h1>
          <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
            Generate respectful, evidence-backed communications for {room.landlordName} regarding {room.title}.
          </p>
        </div>

        <DisputeGenerator
          roomTitle={room.title}
          landlordName={room.landlordName}
          landlordPhone={room.landlordPhone}
          depositAmount={room.securityDeposit}
          fairDeduction={fairDeduction}
          recommendedRefund={recommendedRefund}
          reportNumber={reportNumber}
          reportVerifyUrl={reportVerifyUrl}
          itemsList={itemsList}
        />
      </div>
    </div>
  );
}
