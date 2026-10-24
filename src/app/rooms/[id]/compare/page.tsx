'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ScalesIcon,
  ShieldCheckIcon,
  DocumentIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AlertIcon,
  CheckIcon,
} from '@/components/SvgIcons';
import { StatusStamp } from '@/components/StatusStamp';
import { PhotoComparisonSlider } from '@/components/PhotoComparisonSlider';
import { calculateFairDeduction } from '@/lib/depreciation';

interface DiffItem {
  id: string;
  name: string;
  category: string;
  moveInRating: number;
  moveOutRating: number;
  diffStatus: 'INTACT' | 'NORMAL_WEAR' | 'POSSIBLE_DAMAGE' | 'PRE_EXISTING';
  typicalRepairCost: number;
  fairDeduction: number;
  explanation: string;
  moveInPhoto?: { fileUrl: string; sha256Hash: string };
  moveOutPhoto?: { fileUrl: string; sha256Hash: string };
  notes?: string;
}

export default function RoomComparisonPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null);
  const [moveInReport, setMoveInReport] = useState<any>(null);
  const [moveOutReport, setMoveOutReport] = useState<any>(null);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.room) return;
        setRoom(data.room);

        const inRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_IN');
        const outRpt = data.room.reports?.find((r: any) => r.type === 'MOVE_OUT');

        setMoveInReport(inRpt);
        setMoveOutReport(outRpt);

        // Perform per-item comparison diff
        if (inRpt && outRpt) {
          const itemsMap = new Map<string, any>();
          inRpt.items.forEach((it: any) => {
            itemsMap.set(it.checklistItemId, { in: it, out: null });
          });
          outRpt.items.forEach((it: any) => {
            if (itemsMap.has(it.checklistItemId)) {
              itemsMap.get(it.checklistItemId).out = it;
            } else {
              itemsMap.set(it.checklistItemId, { in: null, out: it });
            }
          });

          const diffList: DiffItem[] = [];

          itemsMap.forEach((pair, checklistId) => {
            const inItem = pair.in;
            const outItem = pair.out;
            const checkItem = inItem?.checklistItem || outItem?.checklistItem;
            if (!checkItem) return;

            const inRating = inItem ? inItem.conditionRating : 5;
            const outRating = outItem ? outItem.conditionRating : inRating;
            const delta = inRating - outRating;

            let diffStatus: DiffItem['diffStatus'] = 'INTACT';
            let deduction = 0;
            let explanation = 'Handed over in identical condition.';

            if (inRating <= 2) {
              diffStatus = 'PRE_EXISTING';
              deduction = 0;
              explanation = 'Condition was already damaged or poor at move-in. Under the Model Tenancy Act, zero deduction is permitted.';
            } else if (delta === 1) {
              diffStatus = 'NORMAL_WEAR';
              deduction = 0;
              explanation = 'Minor score decrease of 1 reflects routine domestic wear & tear. Landlord maintenance responsibility.';
            } else if (delta >= 2) {
              diffStatus = 'POSSIBLE_DAMAGE';
              const dep = calculateFairDeduction(
                checkItem.category,
                checkItem.typicalRepairCostInr,
                data.room.leaseStartDate,
                data.room.leaseEndDate
              );
              deduction = dep.fairDeduction;
              explanation = dep.explanation;
            }

            diffList.push({
              id: checklistId,
              name: checkItem.name,
              category: checkItem.category,
              moveInRating: inRating,
              moveOutRating: outRating,
              diffStatus,
              typicalRepairCost: checkItem.typicalRepairCostInr,
              fairDeduction: deduction,
              explanation,
              moveInPhoto: inItem?.photos?.[0],
              moveOutPhoto: outItem?.photos?.[0],
              notes: outItem?.notes || inItem?.notes,
            });
          });

          setDiffItems(diffList);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading || !room) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center font-mono text-xs text-ink-light">
        Loading Comparison Engine...
      </div>
    );
  }

  const totalDeposit = room.securityDeposit;
  const totalFairDeductions = diffItems.reduce((sum, item) => sum + item.fairDeduction, 0);
  const recommendedRefund = Math.max(0, totalDeposit - totalFairDeductions);

  const damagedItems = diffItems.filter((i) => i.diffStatus === 'POSSIBLE_DAMAGE');
  const normalWearItems = diffItems.filter((i) => i.diffStatus === 'NORMAL_WEAR');
  const preExistingItems = diffItems.filter((i) => i.diffStatus === 'PRE_EXISTING');
  const intactItems = diffItems.filter((i) => i.diffStatus === 'INTACT');

  const filteredItems = diffItems.filter((i) => {
    if (activeFilter === 'ALL') return true;
    return i.diffStatus === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="border-4 border-ink dark:border-paper-300 bg-paper-100 dark:bg-paper-900 p-6 sm:p-8 shadow-paper-lg relative">
        <Link
          href={`/rooms/${room.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-light dark:text-paper-400 hover:text-ink mb-3"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Return to Room Ledger</span>
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-ink dark:border-paper-400">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-forest-600 font-bold mb-1">
              <ScalesIcon className="w-4 h-4" />
              <span>CRYPTOGRAPHIC CONDITION AUDIT & DIFF ENGINE</span>
            </div>
            <h1 className="font-serif font-black text-3xl text-ink dark:text-paper-100">
              Move-In vs Move-Out Comparison
            </h1>
            <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
              {room.title} ({room.area}) • Model Tenancy Act Depreciation Computation
            </p>
          </div>

          <Link
            href={`/rooms/${room.id}/dispute`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vermilion-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-vermilion-700 shadow transition-colors"
          >
            <DocumentIcon className="w-4 h-4" />
            <span>Generate Dispute Notice →</span>
          </Link>
        </div>

        {/* Financial Summary Ledger Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="border-2 border-ink bg-paper-50 dark:bg-paper-800 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              1. Total Security Deposit
            </span>
            <div className="font-mono text-3xl font-black text-ink dark:text-paper-100 mt-1">
              ₹{totalDeposit.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-ink-light">Paid at lease inception</span>
          </div>

          <div className="border-2 border-vermilion-600 bg-vermilion-50 dark:bg-vermilion-950/40 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-vermilion-700 dark:text-vermilion-300">
              2. Fair Depreciated Deductions
            </span>
            <div className="font-mono text-3xl font-black text-vermilion-600 mt-1">
              ₹{totalFairDeductions.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-vermilion-700">
              {damagedItems.length} damaged items after tenancy wear credit
            </span>
          </div>

          <div className="border-2 border-forest-600 bg-forest-50 dark:bg-forest-950/40 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-forest-700 dark:text-forest-300">
              3. Recommended Net Refund
            </span>
            <div className="font-mono text-3xl font-black text-forest-600 mt-1">
              ₹{recommendedRefund.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-forest-700 font-bold">
              Mandatory refund due to tenant
            </span>
          </div>
        </div>

        {/* Legal protection breakdown metrics */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-mono text-ink-light dark:text-paper-300 border-t border-paper-400 mt-6">
          <div className="flex items-center gap-1.5">
            <CheckIcon className="w-4 h-4 text-forest-600" />
            <span>{intactItems.length} Intact Items (₹0)</span>
          </div>
          <div>•</div>
          <div className="flex items-center gap-1.5">
            <CheckIcon className="w-4 h-4 text-forest-600" />
            <span>{normalWearItems.length} Normal Wear Items (₹0 by Law)</span>
          </div>
          <div>•</div>
          <div className="flex items-center gap-1.5">
            <ShieldCheckIcon className="w-4 h-4 text-mustard-600" />
            <span>{preExistingItems.length} Pre-Existing Defects (₹0 Protected)</span>
          </div>
        </div>
      </div>

      {/* Draggable Before / After Photo Slider for Damaged Items */}
      {damagedItems.length > 0 && damagedItems[0].moveInPhoto && damagedItems[0].moveOutPhoto && (
        <div className="border-2 border-ink dark:border-paper-400 bg-paper-100 dark:bg-paper-900 p-6 shadow-paper space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-vermilion-600 font-bold">
                INTERACTIVE EVIDENCE COMPARISON SLIDER
              </span>
              <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
                Visual Diff: {damagedItems[0].name}
              </h3>
            </div>
            <span className="text-xs font-mono text-ink-light">
              Drag slider left / right to compare
            </span>
          </div>

          <div className="max-w-2xl mx-auto">
            <PhotoComparisonSlider
              beforeUrl={damagedItems[0].moveInPhoto.fileUrl}
              afterUrl={damagedItems[0].moveOutPhoto.fileUrl}
              beforeLabel={`MOVE-IN (${damagedItems[0].moveInRating}/5)`}
              afterLabel={`MOVE-OUT (${damagedItems[0].moveOutRating}/5)`}
              beforeHash={damagedItems[0].moveInPhoto.sha256Hash}
              afterHash={damagedItems[0].moveOutPhoto.sha256Hash}
            />
          </div>

          <div className="p-3 bg-paper-200 dark:bg-paper-800 border-l-4 border-mustard-600 text-xs font-mono text-ink-light dark:text-paper-300">
            <strong>Depreciation Formula Applied:</strong> {damagedItems[0].explanation}
          </div>
        </div>
      )}

      {/* Diff Table by Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
            Item-by-Item Condition & Depreciation Audit
          </h3>

          <div className="flex border border-paper-400 rounded-sm overflow-hidden text-xs font-mono">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'POSSIBLE_DAMAGE', label: 'Damage Flagged' },
              { id: 'NORMAL_WEAR', label: 'Normal Wear' },
              { id: 'PRE_EXISTING', label: 'Pre-existing' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveFilter(t.id)}
                className={`px-3 py-1.5 transition-colors ${
                  activeFilter === t.id
                    ? 'bg-ink text-paper-100 font-bold'
                    : 'bg-paper-100 dark:bg-paper-800 text-ink dark:text-paper-300 hover:bg-paper-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-2 border-ink dark:border-paper-400 bg-paper-100 dark:bg-paper-900 shadow-paper overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b-2 border-ink dark:border-paper-400 bg-paper-200 dark:bg-paper-800 font-mono text-[11px] text-ink dark:text-paper-100 uppercase">
                <th className="p-3">Item Particulars</th>
                <th className="p-3">Move-In</th>
                <th className="p-3">Move-Out</th>
                <th className="p-3">Audit Finding</th>
                <th className="p-3">Standard Cost</th>
                <th className="p-3">Fair Tenant Deduction</th>
                <th className="p-3">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-300 dark:divide-paper-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-paper-200/50 dark:hover:bg-paper-800/50">
                  <td className="p-3">
                    <span className="font-serif font-bold text-sm text-ink dark:text-paper-100 block">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-ink-light uppercase">
                      {item.category}
                    </span>
                  </td>

                  <td className="p-3 font-mono">
                    <span className="font-bold">{item.moveInRating}/5</span>
                  </td>

                  <td className="p-3 font-mono">
                    <span className="font-bold">{item.moveOutRating}/5</span>
                  </td>

                  <td className="p-3">
                    <StatusStamp type={item.diffStatus} size="sm" />
                  </td>

                  <td className="p-3 font-mono text-ink-light">
                    ₹{item.typicalRepairCost.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 font-mono font-bold text-sm">
                    {item.fairDeduction > 0 ? (
                      <span className="text-vermilion-600">₹{item.fairDeduction.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-forest-600">₹0 (Zero Deduction)</span>
                    )}
                  </td>

                  <td className="p-3 text-[11px] text-ink-light max-w-xs">
                    {item.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
