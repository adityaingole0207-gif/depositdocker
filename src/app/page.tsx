'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SealIcon,
  ShieldCheckIcon,
  CameraIcon,
  ScalesIcon,
  DocumentIcon,
  ArrowRightIcon,
} from '@/components/SvgIcons';
import { StatusStamp } from '@/components/StatusStamp';

export default function HomePage() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-24">

      {/* ── HERO SECTION ── */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-100 dark:bg-paper-800/80 border border-paper-300 dark:border-paper-700 text-[11px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400">
            <SealIcon className="w-3.5 h-3.5" />
            <span>Digital Mutual Tenancy Protocol • Pune &amp; PCMC</span>
          </div>

          <h1 className="font-serif font-medium text-4xl sm:text-6xl lg:text-7xl text-ink dark:text-paper-100 tracking-tight leading-[1.08]">
            Protect your security deposit <br className="hidden sm:inline" />
            <span className="italic font-normal text-forest-700 dark:text-forest-400">before</span> you unpack.
          </h1>

          <p className="font-sans text-base sm:text-lg text-ink-light dark:text-paper-400 leading-relaxed max-w-2xl mx-auto">
            A tamper-evident move-in &amp; move-out condition record for tenants in Pune.
            Chained cryptographic hashes, statutory wear-and-tear depreciation, and legal notice generation that landlords respect.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="btn-luxury inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-mono font-medium text-xs tracking-wider uppercase hover:opacity-95 shadow-luxury"
            >
              <span>Open Deposit Ledger</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/insights"
              className="btn-luxury inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-paper-300 dark:border-paper-700 bg-paper-50/80 dark:bg-paper-800/80 font-mono font-medium text-xs tracking-wider uppercase text-ink dark:text-paper-200 hover:bg-paper-100 transition-colors"
            >
              <span>Survey Analytics</span>
            </Link>
          </div>

          {/* Micro Stat Bar */}
          <div className="pt-8 flex items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono text-ink-light dark:text-paper-400 border-t border-paper-200 dark:border-paper-800">
            <div>
              <span className="font-semibold text-ink dark:text-paper-100">15 Seeded Rooms</span> in Pune
            </div>
            <div>•</div>
            <div>
              <span className="font-semibold text-forest-700 dark:text-forest-400">SHA-256</span> Chain Verified
            </div>
            <div>•</div>
            <div>
              <span className="font-semibold text-ink dark:text-paper-100">Zero Setup</span> Local Running
            </div>
          </div>
        </div>

        {/* ── Interactive Before / After Gallery Showcase ── */}
        <div className="luxury-card rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-200 dark:border-paper-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-light dark:text-paper-400 block mb-1">
                EVIDENCE VERIFICATION PREVIEW
              </span>
              <h3 className="font-serif font-medium text-xl text-ink dark:text-paper-100">
                Chinchwad 1BHK Flat • Wall &amp; Paint Audit
              </h3>
            </div>
            <StatusStamp type="VERIFIED" size="md" />
          </div>

          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 cols: Interactive Slider */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex justify-between text-[11px] font-mono text-ink-light dark:text-paper-400">
                <span className="text-forest-700 dark:text-forest-400 font-medium">MOVE-IN (DAY 1)</span>
                <span className="text-vermilion-700 dark:text-vermilion-400 font-medium">MOVE-OUT (DAY 365)</span>
              </div>

              <div className="relative h-64 sm:h-72 rounded-xl bg-paper-100 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 overflow-hidden select-none shadow-subtle">
                {/* Move-In Background */}
                <div className="absolute inset-0 bg-[#283C34] flex flex-col items-center justify-center p-6 text-center text-paper-50">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-forest-200 mb-1">
                    Condition: Like New (5/5)
                  </span>
                  <div className="font-serif font-medium text-lg text-paper-100">
                    Living Room Emulsion Paint
                  </div>
                  <p className="text-xs text-forest-100/80 font-sans mt-1 max-w-xs">
                    Original coat pristine. Timestamped &amp; GPS-anchored on July 1, 2023.
                  </p>
                </div>

                {/* Move-Out Overlay */}
                <div
                  className="absolute inset-y-0 right-0 bg-[#422B27] border-l border-paper-50 flex flex-col items-center justify-center p-6 text-center text-paper-50 overflow-hidden"
                  style={{ width: `${100 - sliderPos}%` }}
                >
                  <div className="w-64">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-vermilion-200 mb-1 block">
                      Condition: Fair (3/5)
                    </span>
                    <div className="font-serif font-medium text-lg text-paper-100">
                      Standard Scuff &amp; Wear
                    </div>
                    <p className="text-xs text-vermilion-100/80 font-sans mt-1">
                      Statutory wear &amp; tear under Model Tenancy Act. <strong>₹0 deduction.</strong>
                    </p>
                  </div>
                </div>

                {/* Native Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  aria-label="Before and after condition slider"
                />

                {/* Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-paper-50 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-paper-50 text-ink rounded-full border border-paper-300 shadow-luxury flex items-center justify-center text-[10px] font-mono">
                    ↔
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-mono text-center text-ink-light dark:text-paper-500">
                Drag slider to inspect per-item diff detection
              </p>
            </div>

            {/* Right 5 cols: Cryptographic Summary Dossier */}
            <div className="lg:col-span-5 bg-paper-100/70 dark:bg-paper-800/50 rounded-xl p-5 border border-paper-200 dark:border-paper-700 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-700">
                <span className="text-ink-light dark:text-paper-400">CERTIFICATE DIGEST</span>
                <span className="text-forest-700 dark:text-forest-400 font-semibold">100% INTACT</span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-ink-light dark:text-paper-400 uppercase">SHA-256 Chained Hash</div>
                <div className="p-2 rounded bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-700 text-[9px] break-all text-ink dark:text-paper-200">
                  1f62c0261857fa85affe998be5ff43550dc16f404f1ffb320b9ccbab09e20dc7
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[10px] text-ink-light dark:text-paper-400 uppercase">Audit Count</div>
                  <div className="font-semibold text-ink dark:text-paper-100 mt-0.5">40 Items Checked</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-light dark:text-paper-400 uppercase">GPS Lock</div>
                  <div className="font-semibold text-ink dark:text-paper-100 mt-0.5">18.6279° N, 73.7831° E</div>
                </div>
              </div>

              <div className="pt-2 border-t border-paper-200 dark:border-paper-700 flex justify-between items-center text-[11px]">
                <span className="text-ink-light dark:text-paper-400">Fair Deduction:</span>
                <span className="font-serif font-bold text-sm text-forest-700 dark:text-forest-400">₹0 (Normal Wear)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 PILLARS OF EVIDENCE PROTECTION ── */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-ink dark:text-paper-100 tracking-tight">
            Designed for tenant protection.
          </h2>
          <p className="text-xs sm:text-sm text-ink-light dark:text-paper-400 font-sans">
            How DepositLocker bridges the power asymmetry between landlords and tenants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="luxury-card rounded-xl p-6 space-y-3">
            <div className="w-9 h-9 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 flex items-center justify-center text-forest-700 dark:text-forest-400">
              <CameraIcon className="w-4 h-4" />
            </div>
            <div className="font-mono text-[10px] text-forest-700 dark:text-forest-400 uppercase tracking-widest">
              01 • Capture
            </div>
            <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-100">
              40-Item Checklist
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 leading-relaxed font-sans">
              Structured inspection covering walls, tiles, sanitary fittings, and appliances with fast 1–5 scoring and direct camera capture.
            </p>
          </div>

          <div className="luxury-card rounded-xl p-6 space-y-3">
            <div className="w-9 h-9 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 flex items-center justify-center text-forest-700 dark:text-forest-400">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div className="font-mono text-[10px] text-forest-700 dark:text-forest-400 uppercase tracking-widest">
              02 • Anchoring
            </div>
            <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-100">
              SHA-256 Hash Chaining
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 leading-relaxed font-sans">
              Each photo hash is cryptographically chained into an immutable report digest. Any alteration breaks verification immediately.
            </p>
          </div>

          <div className="luxury-card rounded-xl p-6 space-y-3">
            <div className="w-9 h-9 rounded-full bg-mustard-50 dark:bg-mustard-950/60 border border-mustard-200 dark:border-mustard-800 flex items-center justify-center text-mustard-700 dark:text-mustard-400">
              <ScalesIcon className="w-4 h-4" />
            </div>
            <div className="font-mono text-[10px] text-mustard-700 dark:text-mustard-400 uppercase tracking-widest">
              03 • Fairness
            </div>
            <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-100">
              Depreciation Diff Engine
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 leading-relaxed font-sans">
              Distinguishes standard wear (₹0) from pre-existing flaws (₹0) and calculates fair depreciated repairs as per tenancy laws.
            </p>
          </div>

          <div className="luxury-card rounded-xl p-6 space-y-3">
            <div className="w-9 h-9 rounded-full bg-vermilion-50 dark:bg-vermilion-950/60 border border-vermilion-200 dark:border-vermilion-800 flex items-center justify-center text-vermilion-700 dark:text-vermilion-400">
              <DocumentIcon className="w-4 h-4" />
            </div>
            <div className="font-mono text-[10px] text-vermilion-700 dark:text-vermilion-400 uppercase tracking-widest">
              04 • Resolution
            </div>
            <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-100">
              Legal Dispute Notices
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 leading-relaxed font-sans">
              Generate polite, legally grounded messages citing certificate hashes, tenancy clauses, and consumer helpline escalation paths.
            </p>
          </div>

        </div>
      </section>

      {/* ── TEST-DRIVE CALLOUT ── */}
      <section className="luxury-card rounded-2xl p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
            FULLY SEEDED DEMO
          </span>
          <h3 className="font-serif font-medium text-2xl sm:text-3xl text-ink dark:text-paper-100">
            Ready to inspect the live records?
          </h3>
          <p className="text-xs sm:text-sm text-ink-light dark:text-paper-400 font-sans">
            Pre-loaded with 15 realistic Pune &amp; PCMC rooms, 40 checklist items, and 30 survey responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="btn-luxury px-6 py-3 rounded-full bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-mono font-medium text-xs tracking-wider uppercase shadow-luxury"
          >
            Launch Ledger Dashboard →
          </Link>
          <Link
            href="/about"
            className="btn-luxury px-6 py-3 rounded-full border border-paper-300 dark:border-paper-700 text-ink dark:text-paper-200 font-mono font-medium text-xs tracking-wider uppercase hover:bg-paper-100 transition-colors"
          >
            Design Thinking Dossier
          </Link>
        </div>
      </section>

    </div>
  );
}
