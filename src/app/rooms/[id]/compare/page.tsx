'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ScalesIcon,
  ShieldCheckIcon,
  DocumentIcon,
  ArrowLeftIcon,
  AlertIcon,
  CheckIcon,
  CameraIcon,
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
  depreciationPercent: number;
  tenancyMonths: number;
  explanation: string;
  moveInPhoto?: { fileUrl: string; sha256Hash: string };
  moveOutPhoto?: { fileUrl: string; sha256Hash: string };
  notes?: string;
}

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

// Rating dots visualizer
function RatingDots({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full border transition-colors ${
            i < rating
              ? 'bg-forest-600 border-forest-600'
              : 'bg-transparent border-paper-300 dark:border-paper-600'
          }`}
        />
      ))}
    </span>
  );
}

// Rating delta arrow
function RatingDelta({ from, to }: { from: number; to: number }) {
  const delta = from - to;
  if (delta === 0) return <span className="text-forest-600 font-mono text-xs font-bold">= No Change</span>;
  if (delta > 0)
    return (
      <span className="text-vermilion-600 font-mono text-xs font-bold">
        ▼ {delta} point{delta > 1 ? 's' : ''} drop
      </span>
    );
  return <span className="text-forest-600 font-mono text-xs font-bold">▲ Improved</span>;
}

const CATEGORY_ORDER = [
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

const STATUS_DOT: Record<string, string> = {
  POSSIBLE_DAMAGE: 'bg-vermilion-500',
  NORMAL_WEAR: 'bg-paper-400',
  PRE_EXISTING: 'bg-mustard-500',
  INTACT: 'bg-forest-500',
};

export default function RoomComparisonPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<any>(null);
  const [moveInReport, setMoveInReport] = useState<any>(null);
  const [moveOutReport, setMoveOutReport] = useState<any>(null);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORY_ORDER));
  const [openSliders, setOpenSliders] = useState<Set<string>>(new Set());

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

          itemsMap.forEach((pair) => {
            const inItem = pair.in;
            const outItem = pair.out;
            const checkItem = inItem?.checklistItem || outItem?.checklistItem;
            if (!checkItem) return;

            const inRating = inItem ? inItem.conditionRating : 5;
            const outRating = outItem ? outItem.conditionRating : inRating;
            const delta = inRating - outRating;

            let diffStatus: DiffItem['diffStatus'] = 'INTACT';
            let deduction = 0;
            let depreciationPercent = 0;
            let tenancyMonths = 0;
            let explanation = 'Handed over in identical condition. No deduction warranted.';

            if (inRating <= 2) {
              diffStatus = 'PRE_EXISTING';
              deduction = 0;
              explanation = 'Condition was already poor at move-in. Under the Model Tenancy Act, zero deduction is permitted for pre-existing damage.';
            } else if (delta === 1) {
              diffStatus = 'NORMAL_WEAR';
              deduction = 0;
              explanation = 'A 1-point drop reflects ordinary domestic wear & tear — landlord\'s maintenance responsibility per Section 9 of the Model Tenancy Act.';
            } else if (delta >= 2) {
              diffStatus = 'POSSIBLE_DAMAGE';
              const dep = calculateFairDeduction(
                checkItem.category,
                checkItem.typicalRepairCostInr,
                data.room.leaseStartDate,
                data.room.leaseEndDate
              );
              deduction = dep.fairDeduction;
              depreciationPercent = dep.depreciationPercent;
              tenancyMonths = dep.tenancyMonths;
              explanation = dep.explanation;
            }

            diffList.push({
              id: inItem?.id || outItem?.id,
              name: checkItem.name,
              category: checkItem.category,
              moveInRating: inRating,
              moveOutRating: outRating,
              diffStatus,
              typicalRepairCost: checkItem.typicalRepairCostInr,
              fairDeduction: deduction,
              depreciationPercent,
              tenancyMonths,
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

  const totalDeposit = room?.securityDeposit ?? 0;
  const totalFairDeductions = diffItems.reduce((sum, item) => sum + item.fairDeduction, 0);
  const recommendedRefund = Math.max(0, totalDeposit - totalFairDeductions);

  const animatedRefund = useCountUp(recommendedRefund, 1500);
  const animatedDeductions = useCountUp(totalFairDeductions, 1200);

  const damagedItems = diffItems.filter((i) => i.diffStatus === 'POSSIBLE_DAMAGE');
  const normalWearItems = diffItems.filter((i) => i.diffStatus === 'NORMAL_WEAR');
  const preExistingItems = diffItems.filter((i) => i.diffStatus === 'PRE_EXISTING');
  const intactItems = diffItems.filter((i) => i.diffStatus === 'INTACT');

  // Group by category
  const itemsByCategory = useMemo(() => {
    const filtered = activeFilter === 'ALL' ? diffItems : diffItems.filter((i) => i.diffStatus === activeFilter);
    const groups: Record<string, DiffItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [diffItems, activeFilter]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleSlider = (itemId: string) => {
    setOpenSliders((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-forest-600 border-t-transparent animate-spin" />
        <p className="font-mono text-xs text-ink-light uppercase tracking-widest">Running Comparison Engine…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="font-serif text-2xl text-ink-light">Room not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-mono text-xs text-forest-700 underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!moveOutReport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-mustard-50 dark:bg-mustard-950/30 border border-mustard-200 flex items-center justify-center">
          <CameraIcon className="w-7 h-7 text-mustard-600" />
        </div>
        <div>
          <h2 className="font-serif font-medium text-3xl text-ink dark:text-paper-100 mb-2">
            Move-Out Inspection Needed
          </h2>
          <p className="text-sm text-ink-light dark:text-paper-400 max-w-md">
            Complete the move-out inspection first. The comparison engine will then automatically
            compute per-item condition diffs, depreciation, and your recommended refund.
          </p>
        </div>
        <Link
          href={`/rooms/${room.id}/move-out`}
          className="px-6 py-3 rounded-full bg-forest-700 text-paper-50 font-mono text-xs font-medium uppercase tracking-wider hover:bg-forest-600 transition-colors"
        >
          Start Move-Out Inspection →
        </Link>
        <Link href={`/rooms/${room.id}`} className="font-mono text-xs text-ink-light underline">
          ← Return to Room
        </Link>
      </div>
    );
  }

  const sortedCategories = CATEGORY_ORDER.filter((c) => itemsByCategory[c]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back nav */}
      <Link
        href={`/rooms/${room.id}`}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-light hover:text-ink dark:text-paper-500 dark:hover:text-paper-200 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Room Ledger
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">
        {/* ── Left: Main Content ── */}
        <div className="space-y-8">

          {/* ── Hero Header ── */}
          <div className="luxury-card rounded-2xl overflow-hidden">
            {/* Top accent stripe */}
            <div className="h-1 bg-gradient-to-r from-forest-600 via-forest-500 to-vermilion-500" />

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-forest-700 dark:text-forest-400 font-semibold mb-2">
                    <ScalesIcon className="w-3.5 h-3.5" />
                    Cryptographic Condition Audit
                  </div>
                  <h1 className="font-serif font-medium text-3xl sm:text-4xl text-ink dark:text-paper-100 tracking-tight leading-tight">
                    Move-In vs Move-Out<br />
                    <span className="text-forest-700 dark:text-forest-400">Comparison Report</span>
                  </h1>
                  <p className="text-xs text-ink-light dark:text-paper-400 mt-2 font-sans">
                    {room.title} · {room.area} · Model Tenancy Act Depreciation Applied
                  </p>
                </div>

                <Link
                  href={`/rooms/${room.id}/dispute`}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vermilion-700 hover:bg-vermilion-600 text-paper-50 font-mono text-xs font-medium uppercase tracking-wider shadow-sm transition-colors"
                >
                  <DocumentIcon className="w-3.5 h-3.5" />
                  Generate Dispute Notice
                </Link>
              </div>

              {/* Financial Summary — Deposit Bar */}
              <div className="pt-2">
                <div className="flex items-end justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-light dark:text-paper-400">
                    Deposit Breakdown
                  </span>
                  <span className="font-mono text-[10px] text-ink-light dark:text-paper-400">
                    ₹{totalDeposit.toLocaleString('en-IN')} total
                  </span>
                </div>

                {/* Segmented bar */}
                <div className="h-3 rounded-full bg-paper-200 dark:bg-paper-700 overflow-hidden flex">
                  <div
                    className="h-full bg-vermilion-500 transition-all duration-1000 ease-out"
                    style={{ width: totalDeposit > 0 ? `${Math.min(100, (totalFairDeductions / totalDeposit) * 100)}%` : '0%' }}
                  />
                  <div className="h-full flex-1 bg-forest-500/80" />
                </div>

                <div className="flex items-center gap-4 mt-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-vermilion-500 inline-block" />
                    <span className="text-vermilion-700 dark:text-vermilion-400">
                      Deductions ₹{totalFairDeductions.toLocaleString('en-IN')}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-forest-500 inline-block" />
                    <span className="text-forest-700 dark:text-forest-400">
                      Refund ₹{recommendedRefund.toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
              </div>

              {/* 3 money cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-paper-100/80 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 space-y-1">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-light dark:text-paper-400 block">
                    Deposit Paid
                  </span>
                  <div className="font-serif text-lg sm:text-2xl font-medium text-ink dark:text-paper-100 tabular-nums">
                    ₹{totalDeposit.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-vermilion-50 dark:bg-vermilion-950/30 border border-vermilion-200 dark:border-vermilion-900/60 space-y-1">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-vermilion-700 dark:text-vermilion-400 block">
                    Fair Deductions
                  </span>
                  <div className="font-serif text-lg sm:text-2xl font-medium text-vermilion-700 dark:text-vermilion-400 tabular-nums">
                    ₹{animatedDeductions.toLocaleString('en-IN')}
                  </div>
                  <span className="font-mono text-[9px] text-vermilion-600 dark:text-vermilion-400 block">
                    {damagedItems.length} damaged item{damagedItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-forest-50 dark:bg-forest-950/30 border border-forest-200 dark:border-forest-900/60 space-y-1">
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 block">
                    Net Refund Due
                  </span>
                  <div className="font-serif text-lg sm:text-2xl font-bold text-forest-700 dark:text-forest-400 tabular-nums">
                    ₹{animatedRefund.toLocaleString('en-IN')}
                  </div>
                  <span className="font-mono text-[9px] text-forest-700 dark:text-forest-400 font-semibold block">
                    Legally mandated refund
                  </span>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-paper-200 dark:border-paper-700 text-[11px] font-mono text-ink-light dark:text-paper-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-forest-500" />
                  {intactItems.length} Intact
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-paper-400" />
                  {normalWearItems.length} Normal Wear (₹0 by law)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-mustard-500" />
                  {preExistingItems.length} Pre-existing (₹0 protected)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-vermilion-500" />
                  {damagedItems.length} Damage Flagged
                </span>
              </div>
            </div>
          </div>

          {/* ── Item-by-Item Audit ── */}
          <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif font-medium text-2xl text-ink dark:text-paper-100">
                Item-by-Item Audit
              </h2>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-paper-100 dark:bg-paper-800 border border-paper-200 dark:border-paper-700">
                {[
                  { id: 'ALL', label: 'All', count: diffItems.length },
                  { id: 'POSSIBLE_DAMAGE', label: 'Damage', count: damagedItems.length },
                  { id: 'NORMAL_WEAR', label: 'Wear', count: normalWearItems.length },
                  { id: 'INTACT', label: 'Intact', count: intactItems.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${
                      activeFilter === tab.id
                        ? 'bg-white dark:bg-paper-700 text-ink dark:text-paper-100 shadow-sm font-semibold'
                        : 'text-ink-light dark:text-paper-400 hover:text-ink dark:hover:text-paper-200'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-1 rounded-full text-[9px] ${
                      activeFilter === tab.id
                        ? 'bg-paper-100 dark:bg-paper-600 text-ink dark:text-paper-200'
                        : 'bg-paper-200 dark:bg-paper-700 text-ink-light'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category groups */}
            {sortedCategories.length === 0 && (
              <div className="luxury-card rounded-xl p-8 text-center">
                <p className="font-mono text-xs text-ink-light uppercase tracking-wider">No items match this filter</p>
              </div>
            )}

            {sortedCategories.map((category) => {
              const items = itemsByCategory[category];
              const categoryDeduction = items.reduce((s, i) => s + i.fairDeduction, 0);
              const isExpanded = expandedCategories.has(category);
              const hasDamage = items.some((i) => i.diffStatus === 'POSSIBLE_DAMAGE');

              return (
                <div key={category} className="luxury-card rounded-xl overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-paper-50 dark:hover:bg-paper-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {hasDamage ? (
                        <span className="w-2 h-2 rounded-full bg-vermilion-500 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-forest-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-paper-400 block">
                          Category
                        </span>
                        <span className="font-serif font-medium text-base text-ink dark:text-paper-100">
                          {category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-ink-light bg-paper-100 dark:bg-paper-800 border border-paper-200 dark:border-paper-700 px-2 py-0.5 rounded-full">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {categoryDeduction > 0 && (
                        <span className="font-mono text-sm font-semibold text-vermilion-700 dark:text-vermilion-400">
                          −₹{categoryDeduction.toLocaleString('en-IN')}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-ink-light transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {/* Items list */}
                  {isExpanded && (
                    <div className="border-t border-paper-200 dark:border-paper-700 divide-y divide-paper-100 dark:divide-paper-800">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 sm:p-5 space-y-3">
                          {/* Item header row */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-serif font-medium text-base text-ink dark:text-paper-100">
                                  {item.name}
                                </h3>
                                <StatusStamp type={item.diffStatus} size="sm" />
                              </div>
                              {item.notes && (
                                <p className="text-xs text-ink-light dark:text-paper-400 mt-1 font-sans">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              {item.fairDeduction > 0 ? (
                                <span className="font-mono text-sm font-bold text-vermilion-700 dark:text-vermilion-400">
                                  −₹{item.fairDeduction.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-forest-700 dark:text-forest-400 font-semibold">
                                  ₹0
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rating comparison */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 p-3 rounded-lg bg-paper-50 dark:bg-paper-800/50">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-forest-700 dark:text-forest-400 block">
                                Move-In
                              </span>
                              <div className="flex items-center gap-2">
                                <RatingDots rating={item.moveInRating} />
                                <span className="font-mono text-xs text-ink dark:text-paper-200 font-semibold">
                                  {item.moveInRating}/5
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <RatingDelta from={item.moveInRating} to={item.moveOutRating} />
                            </div>

                            <div className="space-y-1">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-vermilion-700 dark:text-vermilion-400 block">
                                Move-Out
                              </span>
                              <div className="flex items-center gap-2">
                                <RatingDots rating={item.moveOutRating} />
                                <span className="font-mono text-xs text-ink dark:text-paper-200 font-semibold">
                                  {item.moveOutRating}/5
                                </span>
                              </div>
                            </div>

                            {item.diffStatus === 'POSSIBLE_DAMAGE' && item.depreciationPercent > 0 && (
                              <div className="ml-auto text-right space-y-0.5">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-ink-light block">
                                  Depreciation Applied
                                </span>
                                <span className="font-mono text-xs font-bold text-ink dark:text-paper-200">
                                  {item.depreciationPercent}% credit
                                </span>
                                <span className="font-mono text-[9px] text-ink-light dark:text-paper-400 block">
                                  of ₹{item.typicalRepairCost.toLocaleString('en-IN')} gross cost
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Legal explanation */}
                          <p className="text-xs text-ink-light dark:text-paper-400 leading-relaxed font-sans border-l-2 border-paper-300 dark:border-paper-600 pl-3">
                            {item.explanation}
                          </p>

                          {/* Photo comparison toggle */}
                          {item.moveInPhoto && item.moveOutPhoto && (
                            <div className="space-y-3">
                              <button
                                onClick={() => toggleSlider(item.id)}
                                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-forest-700 dark:text-forest-400 hover:text-forest-600 transition-colors"
                              >
                                <CameraIcon className="w-3.5 h-3.5" />
                                {openSliders.has(item.id) ? 'Hide' : 'Compare'} Photos
                                <svg className={`w-3.5 h-3.5 transition-transform ${openSliders.has(item.id) ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>

                              {openSliders.has(item.id) && (
                                <div className="rounded-xl overflow-hidden border border-paper-200 dark:border-paper-700">
                                  <PhotoComparisonSlider
                                    beforeUrl={item.moveInPhoto.fileUrl}
                                    afterUrl={item.moveOutPhoto.fileUrl}
                                    beforeLabel={`MOVE-IN (${item.moveInRating}/5)`}
                                    afterLabel={`MOVE-OUT (${item.moveOutRating}/5)`}
                                    beforeHash={item.moveInPhoto.sha256Hash}
                                    afterHash={item.moveOutPhoto.sha256Hash}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Thumbnail row (when slider is closed) */}
                          {(item.moveInPhoto || item.moveOutPhoto) && !openSliders.has(item.id) && (
                            <div className="flex gap-3">
                              {item.moveInPhoto && (
                                <div className="relative rounded-lg overflow-hidden border border-paper-200 dark:border-paper-700 w-16 h-12 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.moveInPhoto.fileUrl} alt="Move-in" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-forest-900/60 flex items-center justify-center">
                                    <span className="text-[7px] font-mono text-white font-bold">IN</span>
                                  </div>
                                </div>
                              )}
                              {item.moveOutPhoto && (
                                <div className="relative rounded-lg overflow-hidden border border-paper-200 dark:border-paper-700 w-16 h-12 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.moveOutPhoto.fileUrl} alt="Move-out" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-vermilion-900/60 flex items-center justify-center">
                                    <span className="text-[7px] font-mono text-white font-bold">OUT</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Sticky Sidebar: Audit Receipt ── */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            {/* Receipt card */}
            <div className="luxury-card rounded-2xl overflow-hidden">
              <div className="bg-ink dark:bg-paper-900 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-forest-400" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-paper-300 font-semibold">
                    Deposit Audit Receipt
                  </span>
                </div>
                <p className="font-mono text-[9px] text-paper-500 mt-0.5">
                  {moveInReport?.reportNumber} → {moveOutReport?.reportNumber}
                </p>
              </div>

              <div className="p-5 space-y-3">
                {/* Line items */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-ink-light dark:text-paper-400">
                    <span>Security deposit</span>
                    <span className="font-semibold text-ink dark:text-paper-200">
                      ₹{totalDeposit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="border-t border-paper-200 dark:border-paper-700 pt-2 space-y-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-ink-light dark:text-paper-500">Deductions breakdown</p>
                    {damagedItems.length === 0 ? (
                      <p className="text-forest-700 dark:text-forest-400 text-[11px]">No deductions warranted ✓</p>
                    ) : (
                      damagedItems.map((item) => (
                        <div key={item.id} className="flex justify-between gap-2">
                          <span className="text-ink-light dark:text-paper-400 truncate text-[10px]">{item.name}</span>
                          <span className="text-vermilion-700 dark:text-vermilion-400 shrink-0 text-[10px]">
                            −₹{item.fairDeduction.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-paper-200 dark:border-paper-700 pt-2 flex justify-between font-semibold">
                    <span className="text-ink-light dark:text-paper-400">Total deductions</span>
                    <span className="text-vermilion-700 dark:text-vermilion-400">
                      −₹{totalFairDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Refund callout */}
                <div className="mt-4 p-4 rounded-xl bg-forest-50 dark:bg-forest-950/30 border border-forest-200 dark:border-forest-900/50 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-forest-700 dark:text-forest-400 mb-1">
                    Recommended Refund
                  </p>
                  <p className="font-serif text-3xl font-bold text-forest-700 dark:text-forest-400 tabular-nums">
                    ₹{animatedRefund.toLocaleString('en-IN')}
                  </p>
                  <p className="font-mono text-[9px] text-forest-700/70 dark:text-forest-500 mt-1">
                    Legally mandated · {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Evidence summary */}
                <div className="space-y-1.5 pt-2 border-t border-paper-200 dark:border-paper-700">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-light dark:text-paper-500">
                    Evidence Chain
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <CheckIcon className="w-3 h-3 text-forest-600 shrink-0" />
                    <span className="text-ink-light dark:text-paper-400">
                      {diffItems.length} items verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <CheckIcon className="w-3 h-3 text-forest-600 shrink-0" />
                    <span className="text-ink-light dark:text-paper-400">SHA-256 hash chain intact</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <CheckIcon className="w-3 h-3 text-forest-600 shrink-0" />
                    <span className="text-ink-light dark:text-paper-400">MTA depreciation applied</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/rooms/${room.id}/dispute`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-vermilion-700 hover:bg-vermilion-600 text-paper-50 font-mono text-[10px] uppercase tracking-wider transition-colors"
                  >
                    <DocumentIcon className="w-3.5 h-3.5" />
                    Generate Dispute Notice
                  </Link>
                  {moveInReport?.shareToken && (
                    <Link
                      href={`/reports/${moveInReport.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-paper-200 dark:border-paper-700 text-ink dark:text-paper-200 font-mono text-[10px] uppercase tracking-wider hover:bg-paper-50 dark:hover:bg-paper-800 transition-colors"
                    >
                      View Move-In Report
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Legal note */}
            <div className="p-4 rounded-xl bg-mustard-50 dark:bg-mustard-950/20 border border-mustard-200 dark:border-mustard-900/50">
              <p className="font-mono text-[9px] uppercase tracking-wider text-mustard-700 dark:text-mustard-400 mb-1 font-semibold">
                Legal Basis
              </p>
              <p className="font-sans text-[11px] text-mustard-900 dark:text-mustard-300 leading-relaxed">
                Deductions calculated per the Model Tenancy Act (2021). Normal wear & tear is the landlord&apos;s responsibility. Pre-existing damage cannot be charged to the outgoing tenant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Inline receipt (visible only below lg) */}
      <div className="lg:hidden mt-8 luxury-card rounded-2xl overflow-hidden">
        <div className="bg-ink dark:bg-paper-900 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-forest-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper-300 font-semibold">
              Audit Receipt Summary
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-light mb-1">Deposit</p>
              <p className="font-serif text-lg font-medium text-ink dark:text-paper-100">
                ₹{totalDeposit.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vermilion-700 mb-1">Deductions</p>
              <p className="font-serif text-lg font-medium text-vermilion-700">
                −₹{totalFairDeductions.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-forest-700 mb-1">Refund</p>
              <p className="font-serif text-lg font-bold text-forest-700">
                ₹{animatedRefund.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Link
            href={`/rooms/${room.id}/dispute`}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-vermilion-700 hover:bg-vermilion-600 text-paper-50 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <DocumentIcon className="w-3.5 h-3.5" />
            Generate Dispute Notice
          </Link>
        </div>
      </div>
    </div>
  );
}
