'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartIcon, ShieldCheckIcon, AlertIcon, ScalesIcon } from '@/components/SvgIcons';

// ── Survey Dataset ──────────────────────────────────────────────────────────

const PROOF_OUTCOME_DATA = [
  { name: 'Full Refund', withProof: 8, withoutProof: 0 },
  { name: 'Partial Recovery', withProof: 4, withoutProof: 3 },
  { name: 'Full Loss', withProof: 0, withoutProof: 15 },
];

const CATEGORY_DAMAGE_DATA = [
  { category: 'Walls & Paint', count: 18, avgCost: 2800 },
  { category: 'Furniture', count: 12, avgCost: 3200 },
  { category: 'Flooring', count: 9, avgCost: 2700 },
  { category: 'Bathroom', count: 8, avgCost: 1900 },
  { category: 'Doors & Windows', count: 7, avgCost: 2200 },
  { category: 'Electrical', count: 5, avgCost: 1400 },
];

const AREA_ANALYSIS_DATA = [
  { area: 'Akurdi', avgDeposit: 22800, avgDeduction: 5540, lossRate: 24.3, demo: 'Engineering students & freshers' },
  { area: 'Wakad', avgDeposit: 47800, avgDeduction: 6160, lossRate: 12.9, demo: 'Corporate families & shared flats' },
  { area: 'Hinjewadi', avgDeposit: 43200, avgDeduction: 11500, lossRate: 26.6, demo: 'IT professionals (Phase 1-3)' },
  { area: 'Nigdi', avgDeposit: 29800, avgDeduction: 6870, lossRate: 23.1, demo: 'Auto hub working professionals' },
  { area: 'Chinchwad', avgDeposit: 30200, avgDeduction: 6250, lossRate: 20.7, demo: 'Mixed professional tenants' },
  { area: 'Kothrud', avgDeposit: 31250, avgDeduction: 7250, lossRate: 23.2, demo: 'MIT students & tech workers' },
];

const DEDUCTION_REASONS_DATA = [
  { reason: 'Mandatory Repainting Fees', value: 42, color: '#BD3E28' },
  { reason: 'Deep Cleaning & Sanitization', value: 24, color: '#B8781B' },
  { reason: 'Pre-existing Surface Scratches', value: 18, color: '#245244' },
  { reason: 'Appliance & Fixture Claims', value: 10, color: '#6E695F' },
  { reason: 'Miscellaneous Charges', value: 6, color: '#9C968B' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#FAF9F6',
  border: '1px solid #DFDBD2',
  borderRadius: '8px',
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: '11px',
  boxShadow: '0 4px 12px rgba(23, 22, 20, 0.05)',
  padding: '8px 12px',
};

function HorizBar({ label, value, color, max = 42 }: { label: string; value: number; color: string; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-mono text-ink dark:text-paper-300 truncate">{label}</span>
        <span className="font-mono text-xs font-semibold text-ink dark:text-paper-100 tabular-nums">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-paper-200 dark:bg-paper-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const maxDeduction = Math.max(...AREA_ANALYSIS_DATA.map((d) => d.avgDeduction));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

      {/* ── Header ── */}
      <div className="luxury-card rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
            <ChartIcon className="w-3.5 h-3.5" />
            <span>FIELD TENANCY STUDY • 30 SURVEY RESPONDENTS • PUNE</span>
          </div>
          <h1 className="font-serif font-medium text-3xl sm:text-5xl text-ink dark:text-paper-100 tracking-tight leading-[1.1]">
            Security deposit loss analytics.
          </h1>
          <p className="text-sm sm:text-base text-ink-light dark:text-paper-400 font-sans max-w-2xl leading-relaxed">
            Data gathered across Akurdi, Wakad, Hinjewadi, and Kothrud reveals that tenants lacking photographic proof forfeit an average of <span className="font-mono font-medium text-ink dark:text-paper-100">₹7,260</span> per vacate.
          </p>
        </div>

        {/* 4 Clean Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Avg Loss Rate
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-vermilion-700 dark:text-vermilion-400 tabular-nums">
              22.4%
            </div>
            <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
              Of total deposit forfeited
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Recovery With Proof
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-forest-700 dark:text-forest-400 tabular-nums">
              100%
            </div>
            <span className="text-[10px] font-mono text-forest-700 dark:text-forest-400 block">
              Full or partial refund secured
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Loss Without Proof
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-vermilion-700 dark:text-vermilion-400 tabular-nums">
              83.3%
            </div>
            <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
              Conceded arbitrary deductions
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              Top Disputed Item
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-ink dark:text-paper-100">
              Repaint
            </div>
            <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
              42% of all claims
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Outcome Chart (3 cols) */}
        <div className="luxury-card rounded-2xl p-6 sm:p-8 lg:col-span-3 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
              EVIDENCE VERIFICATION EFFECT
            </span>
            <h3 className="font-serif font-medium text-xl text-ink dark:text-paper-100">
              With Photo Proof vs Without Proof
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 font-sans">
              Tenants holding verifiable cryptographic move-in records had zero total deposit losses.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PROOF_OUTCOME_DATA}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                barGap={4}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="name"
                  stroke="#9C968B"
                  tick={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: '#6E695F' }}
                  axisLine={{ stroke: '#DFDBD2' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9C968B"
                  tick={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: '#6E695F' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) => [`${v} respondents`, name]}
                />
                <Legend
                  wrapperStyle={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="withProof" name="Had Photo Proof" fill="#245244" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withoutProof" name="No Move-in Proof" fill="#BD3E28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deduction Reasons Breakdown (2 cols) */}
        <div className="luxury-card rounded-2xl p-6 sm:p-8 lg:col-span-2 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
              BREAKDOWN OF CLAIMS
            </span>
            <h3 className="font-serif font-medium text-xl text-ink dark:text-paper-100">
              Primary Deduction Pretexts
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 font-sans">
              Most frequent grounds landlords cite to withhold deposit funds.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {DEDUCTION_REASONS_DATA.map((d) => (
              <HorizBar key={d.reason} label={d.reason} value={d.value} color={d.color} />
            ))}
          </div>

          <div className="pt-4 border-t border-paper-200 dark:border-paper-800">
            <p className="text-[11px] font-mono text-ink-light dark:text-paper-400 leading-relaxed">
              *Model Tenancy Act specifies that repainting costs for routine wear are the owner's legal responsibility.
            </p>
          </div>
        </div>

      </div>

      {/* ── Section 2: Category Damage Frequency & Cost ── */}
      <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
              REPAIR COST BENCHMARKS (INR)
            </span>
            <h3 className="font-serif font-medium text-xl sm:text-2xl text-ink dark:text-paper-100">
              Category Frequency vs Average Repair Cost
            </h3>
          </div>
          <span className="font-mono text-xs text-ink-light dark:text-paper-400">
            Field quotes from Pune contractors
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CATEGORY_DAMAGE_DATA}
              margin={{ top: 5, right: 15, left: 5, bottom: 15 }}
              barGap={3}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="category"
                stroke="#9C968B"
                tick={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: '#6E695F' }}
                axisLine={{ stroke: '#DFDBD2' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#9C968B"
                tick={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: '#6E695F' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9C968B"
                tick={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: '#6E695F' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string) =>
                  name === 'Avg Cost (₹)' ? [`₹${v.toLocaleString('en-IN')}`, name] : [v, name]
                }
              />
              <Legend wrapperStyle={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="count" name="Dispute Incidents" fill="#245244" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avgCost" name="Avg Cost (₹)" fill="#BD3E28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Section 3: Area-Wise Table ── */}
      <div className="luxury-card rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-paper-200 dark:border-paper-800 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
            LOCALITY RISK BENCHMARKS
          </span>
          <h3 className="font-serif font-medium text-xl sm:text-2xl text-ink dark:text-paper-100">
            Pune &amp; PCMC Locality Analysis
          </h3>
          <p className="text-xs text-ink-light dark:text-paper-400 font-sans">
            Click any locality row to inspect fair vs inflated deduction breakdowns.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-200 dark:border-paper-800 bg-paper-100/50 dark:bg-paper-800/50 text-[10px] font-mono uppercase tracking-widest text-ink-light dark:text-paper-400">
                <th className="px-6 py-3 font-medium">Locality</th>
                <th className="px-6 py-3 font-medium">Tenant Base</th>
                <th className="px-6 py-3 font-medium">Avg Deposit</th>
                <th className="px-6 py-3 font-medium">Avg Deduction</th>
                <th className="px-6 py-3 font-medium">Loss Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-paper-800 font-mono text-xs">
              {AREA_ANALYSIS_DATA.map((row) => {
                const isActive = activeArea === row.area;
                return (
                  <tr
                    key={row.area}
                    onClick={() => setActiveArea(isActive ? null : row.area)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-paper-100 dark:bg-paper-800/80'
                        : 'hover:bg-paper-100/50 dark:hover:bg-paper-800/40'
                    }`}
                  >
                    <td className="px-6 py-4 font-serif font-medium text-sm text-ink dark:text-paper-100">
                      {row.area}
                    </td>
                    <td className="px-6 py-4 text-ink-light dark:text-paper-400 font-sans text-xs">
                      {row.demo}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink dark:text-paper-100 tabular-nums">
                      ₹{row.avgDeposit.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-medium text-vermilion-700 dark:text-vermilion-400 tabular-nums">
                      ₹{row.avgDeduction.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        row.lossRate > 25
                          ? 'bg-vermilion-50 dark:bg-vermilion-950/40 text-vermilion-700 dark:text-vermilion-300'
                          : 'bg-forest-50 dark:bg-forest-950/40 text-forest-700 dark:text-forest-300'
                      }`}>
                        {row.lossRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeArea && (() => {
          const row = AREA_ANALYSIS_DATA.find((r) => r.area === activeArea)!;
          const fairDeduction = Math.round(row.avgDeduction * 0.4);
          const inflated = row.avgDeduction - fairDeduction;
          return (
            <div className="border-t border-paper-200 dark:border-paper-800 bg-paper-100/60 dark:bg-paper-800/60 p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400 block mb-1">
                  Fair Depreciated Deduction
                </span>
                <div className="font-serif text-2xl font-medium text-forest-700 dark:text-forest-400 tabular-nums">
                  ₹{fairDeduction.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400 block mb-1">
                  Arbitrary Overcharge
                </span>
                <div className="font-serif text-2xl font-medium text-vermilion-700 dark:text-vermilion-400 tabular-nums">
                  ₹{inflated.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400 block mb-1">
                  Primary Risk Factor
                </span>
                <p className="text-xs text-ink-light dark:text-paper-300 font-sans leading-relaxed">
                  {row.lossRate > 25
                    ? 'High tenant turnover leads landlords to automatically bill full repainting without proving tenant-caused damage.'
                    : 'Unrecorded pre-existing scratches on wooden doors and fittings are the leading dispute catalyst.'}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
