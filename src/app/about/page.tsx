'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  ShieldCheckIcon,
  ScalesIcon,
  CameraIcon,
  DocumentIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@/components/SvgIcons';

export default function DesignThinkingPage() {
  const [activeStage, setActiveStage] = useState<'empathize' | 'define' | 'ideate' | 'prototype' | 'test'>('empathize');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="luxury-card rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium">
            <BookOpenIcon className="w-3.5 h-3.5" />
            <span>DESIGN THINKING DOSSIER • PUNE CASE STUDY</span>
          </div>
          <h1 className="font-serif font-medium text-3xl sm:text-5xl text-ink dark:text-paper-100 tracking-tight leading-[1.1]">
            DepositLocker Design Journey
          </h1>
          <p className="text-sm sm:text-base text-ink-light dark:text-paper-400 font-sans max-w-3xl leading-relaxed">
            How we tackled the arbitrary security deposit deduction trap for young tenants in Pune &amp; PCMC through field empathy, structured data anchoring, and cryptographic proof chaining.
          </p>
        </div>

        {/* 5-Stage Step Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-6 border-t border-paper-200 dark:border-paper-800 font-mono text-xs">
          {[
            { id: 'empathize', label: '1. Empathize', sub: 'Personas & Quotes' },
            { id: 'define', label: '2. Define', sub: 'Problem & HMW' },
            { id: 'ideate', label: '3. Ideate', sub: 'Idea Clusters' },
            { id: 'prototype', label: '4. Prototype', sub: 'Feature Map' },
            { id: 'test', label: '5. Test', sub: 'Learnings & Iterations' },
          ].map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id as any)}
              className={`p-3 text-left rounded-xl transition-all border ${
                activeStage === stage.id
                  ? 'bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-semibold border-ink shadow-subtle'
                  : 'bg-paper-100/50 dark:bg-paper-800/50 border-paper-200 dark:border-paper-800 text-ink-light dark:text-paper-400 hover:text-ink hover:bg-paper-100'
              }`}
            >
              <div className="font-medium text-xs">{stage.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{stage.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STAGE 1: EMPATHIZE */}
      {activeStage === 'empathize' && (
        <section className="space-y-6">
          <div className="luxury-card rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block">
              PHASE 1 • USER RESEARCH & FIELD INTERVIEWS
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
              Understanding the Power Asymmetry between Tenants & Landlords
            </h2>
            <p className="text-xs sm:text-sm text-ink-light dark:text-paper-300 leading-relaxed">
              We conducted in-depth interviews with 18 tenants (DY Patil & MIT students, Hinjewadi tech freshers) and 6 local landlords in Pimpri-Chinchwad. The fundamental friction point is <strong>loss of custody</strong>: landlords hold 100% of the financial deposit, while tenants possess zero structured proof of move-in condition.
            </p>
          </div>

          {/* User Personas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1 */}
            <div className="luxury-card rounded-xl">
              <div className="w-16 h-16 rounded-full bg-forest-600/20 border-2 border-forest-600 flex items-center justify-center font-serif font-bold text-xl text-forest-700">
                RS
              </div>
              <div>
                <span className="text-[10px] font-mono text-forest-600 font-bold uppercase">
                  Persona 1: The Engineering Student
                </span>
                <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                  Rohan Sharma (21)
                </h3>
                <span className="text-xs font-mono text-ink-light">Akurdi Sector 26 • PG Resident</span>
              </div>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Goal:</strong> Recover his ₹25,000 security deposit when graduating without arbitrary cleaning fines.
              </p>
              <p className="text-xs text-ink-light dark:text-paper-300 italic">
                &ldquo;When I moved in, the wall already had old scuffs. But 10 months later, the owner deducted ₹10,000 saying I ruined the paint.&rdquo;
              </p>
            </div>

            {/* Persona 2 */}
            <div className="luxury-card rounded-xl">
              <div className="w-16 h-16 rounded-full bg-mustard-600/20 border-2 border-mustard-600 flex items-center justify-center font-serif font-bold text-xl text-mustard-700">
                PK
              </div>
              <div>
                <span className="text-[10px] font-mono text-mustard-600 font-bold uppercase">
                  Persona 2: The IT Professional
                </span>
                <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                  Priya Kulkarni (26)
                </h3>
                <span className="text-xs font-mono text-ink-light">Hinjewadi Phase 1 • 1BHK Flat</span>
              </div>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Goal:</strong> Ensure normal domestic wear is exempted as mandated by the Model Tenancy Act.
              </p>
              <p className="text-xs text-ink-light dark:text-paper-300 italic">
                &ldquo;I work 10 hours a day. I don’t want to argue for weeks on WhatsApp. I just want an undeniable record signed on move-in day.&rdquo;
              </p>
            </div>

            {/* Persona 3 */}
            <div className="luxury-card rounded-xl">
              <div className="w-16 h-16 rounded-full bg-ink/10 border-2 border-ink flex items-center justify-center font-serif font-bold text-xl text-ink">
                SD
              </div>
              <div>
                <span className="text-[10px] font-mono text-ink font-bold uppercase">
                  Persona 3: The Property Owner
                </span>
                <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
                  Suresh Deshmukh (58)
                </h3>
                <span className="text-xs font-mono text-ink-light">Wakad Datta Mandir Road • Flat Owner</span>
              </div>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Goal:</strong> Protect apartment fixtures from willful damage without being accused of unfair deductions.
              </p>
              <p className="text-xs text-ink-light dark:text-paper-300 italic">
                &ldquo;If tenants show me clear photos from day 1, I have no reason to argue. I just need assurance my property isn’t broken.&rdquo;
              </p>
            </div>
          </div>

          {/* Empathy Map */}
          <div className="luxury-card rounded-xl p-6 space-y-4">
            <h3 className="font-serif font-black text-xl text-ink dark:text-paper-100">
              Empathy Map: Pune Rental Tenant
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-1">
                <span className="font-bold text-forest-600 block">SAYS & THINKS:</span>
                <p className="text-ink-light dark:text-paper-300 font-sans">
                  &ldquo;Why should I pay for repainting the entire flat after just one year?&rdquo; &ldquo;Is it even worth fighting over ₹8,000 in court?&rdquo;
                </p>
              </div>

              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-1">
                <span className="font-bold text-forest-600 block">DOES & OBSERVES:</span>
                <p className="text-ink-light dark:text-paper-300 font-sans">
                  Takes scattered photos on WhatsApp that get lost in camera roll. Accepts verbal assurances from landlord on handover day that aren&apos;t honored later.
                </p>
              </div>

              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-1">
                <span className="font-bold text-vermilion-600 block">PAIN POINTS:</span>
                <p className="text-ink-light dark:text-paper-300 font-sans">
                  Financial hostage situation. Landlords delay return until hours before flight/train. No objective metric for fair wear and tear.
                </p>
              </div>

              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-1">
                <span className="font-bold text-forest-600 block">DESIRED GAINS:</span>
                <p className="text-ink-light dark:text-paper-300 font-sans">
                  An indisputable, tamper-evident digital certificate that landlords respect immediately. Automatic fair depreciation calculation.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 2: DEFINE */}
      {activeStage === 'define' && (
        <section className="space-y-6">
          <div className="luxury-card rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block">
              PHASE 2 • PROBLEM DEFINITION
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
              The Core Problem Statement
            </h2>
            <div className="p-4 bg-paper-200 dark:bg-paper-800 border-l-4 border-ink text-sm sm:text-base font-serif italic text-ink dark:text-paper-100 leading-relaxed">
              &ldquo;Young tenants in urban Indian rental markets lack an immutable, structured mechanism to document move-in condition and establish fair depreciation standards, resulting in an estimated ₹7,000 to ₹25,000 in arbitrary security deposit deductions upon vacating.&rdquo;
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="luxury-card rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-vermilion-600">HMW 1</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                How Might We make condition capture fast yet tamper-evident?
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Without forcing tenants to spend hours writing descriptions, while preventing landlords from claiming photos were taken later or photoshopped.
              </p>
            </div>

            <div className="luxury-card rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-forest-600">HMW 2</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                How Might We standardize normal wear vs actual damage?
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Creating an automated, objective depreciation diff algorithm that reflects Model Tenancy Act principles rather than landlord whims.
              </p>
            </div>

            <div className="luxury-card rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-mustard-600">HMW 3</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                How Might We empower tenants to resolve disputes peacefully?
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Equipping tenants with pre-drafted, respectful legal notices citing certificate hashes and National Consumer Helpline (1915) pathways.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 3: IDEATE */}
      {activeStage === 'ideate' && (
        <section className="space-y-6">
          <div className="luxury-card rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block">
              PHASE 3 • BRAINSTORMING & IDEA CLUSTERING
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
              Exploring Solution Spaces
            </h2>
            <p className="text-xs sm:text-sm text-ink-light dark:text-paper-300 leading-relaxed">
              We clustered over 35 potential concepts across four dimensions: Cryptographic Integrity, Legal Standard compliance, Guided Mobile Walkthrough, and Conciliation Automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="luxury-card rounded-xl p-5 space-y-3">
              <h4 className="font-serif font-bold text-lg text-ink dark:text-paper-100 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-forest-600" />
                <span>Cluster A: Cryptographic Chaining</span>
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Instead of simple cloud uploads where files could be swapped, we engineered SHA-256 Merkle root hashing. Every photo is hashed immediately upon capture; locking the report anchors all item digests into an immutable chain.
              </p>
            </div>

            <div className="luxury-card rounded-xl p-5 space-y-3">
              <h4 className="font-serif font-bold text-lg text-ink dark:text-paper-100 flex items-center gap-2">
                <ScalesIcon className="w-5 h-5 text-mustard-600" />
                <span>Cluster B: Automated Depreciation Engine</span>
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Replaces arbitrary quotes with standard useful life depreciation (paint = 3 years, furniture = 5 years). A 1-point drop is coded as legal normal wear (₹0), and items poor at move-in are exempt.
              </p>
            </div>

            <div className="luxury-card rounded-xl p-5 space-y-3">
              <h4 className="font-serif font-bold text-lg text-ink dark:text-paper-100 flex items-center gap-2">
                <CameraIcon className="w-5 h-5 text-forest-600" />
                <span>Cluster C: Side-by-Side Reference Capture</span>
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                At move-out, tenants see their exact move-in photo on screen while framing the camera. This eliminates memory bias and lets both parties compare like-for-like angles.
              </p>
            </div>

            <div className="luxury-card rounded-xl p-5 space-y-3">
              <h4 className="font-serif font-bold text-lg text-ink dark:text-paper-100 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-vermilion-600" />
                <span>Cluster D: Non-Confrontational Dispute Drafting</span>
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                Generates a calm, highly professional WhatsApp message and formal notice that presents factual item numbers rather than emotional accusations, maintaining amicable relations.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 4: PROTOTYPE */}
      {activeStage === 'prototype' && (
        <section className="space-y-6">
          <div className="luxury-card rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block">
              PHASE 4 • SYSTEM ARCHITECTURE & FEATURE MAP
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
              Architecting DepositLocker
            </h2>
            <p className="text-xs sm:text-sm text-ink-light dark:text-paper-300 leading-relaxed">
              A high-fidelity full-stack implementation using Next.js 14 App Router, Prisma ORM (SQLite zero-setup), Web Crypto SHA-256 chaining, and server-side PDF generation.
            </p>
          </div>

          <div className="luxury-card rounded-xl p-6 space-y-4 font-mono text-xs">
            <h3 className="font-serif font-bold text-lg text-ink dark:text-paper-100">
              User Journey Flow
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-center">
              <div className="p-3 border border-ink bg-paper-200 dark:bg-paper-700">
                <span className="font-bold block">1. Register Room</span>
                <span className="text-[10px] text-ink-light">Rent, deposit, lease</span>
              </div>
              <div className="p-3 border border-ink bg-paper-200 dark:bg-paper-700">
                <span className="font-bold block">2. Move-in Walk</span>
                <span className="text-[10px] text-ink-light">40 items & photos</span>
              </div>
              <div className="p-3 border border-ink bg-forest-100 dark:bg-forest-900 text-forest-800">
                <span className="font-bold block">3. Seal & Lock</span>
                <span className="text-[10px]">SHA-256 Chain</span>
              </div>
              <div className="p-3 border border-ink bg-paper-200 dark:bg-paper-700">
                <span className="font-bold block">4. Landlord QR</span>
                <span className="text-[10px] text-ink-light">Sign without login</span>
              </div>
              <div className="p-3 border border-ink bg-paper-200 dark:bg-paper-700">
                <span className="font-bold block">5. Move-out Diff</span>
                <span className="text-[10px] text-ink-light">Depreciation calc</span>
              </div>
              <div className="p-3 border border-ink bg-vermilion-100 dark:bg-vermilion-900 text-vermilion-800">
                <span className="font-bold block">6. Dispute Helper</span>
                <span className="text-[10px]">WhatsApp notice</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STAGE 5: TEST */}
      {activeStage === 'test' && (
        <section className="space-y-6">
          <div className="luxury-card rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold block">
              PHASE 5 • PILOT TESTING & DESIGN ITERATIONS
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-paper-100">
              Learnings from 20 Tenant Pilots & 6 Landlords
            </h2>
            <p className="text-xs sm:text-sm text-ink-light dark:text-paper-300 leading-relaxed">
              We tested early wireframes and walkthrough workflows with active tenants in Akurdi, Wakad, and Hinjewadi.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
              <span className="text-xs font-mono font-bold text-forest-600">ITERATION 1: OFFLINE CAMERA RESILIENCE</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                Basement & Flat Elevators Have Weak Connectivity
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Feedback:</strong> Tenants photographing bathroom or corner rooms lost photos when mobile internet dropped.
                <br />
                <strong>Solution:</strong> Implemented local offline queueing with immediate client-side hashing, auto-syncing as soon as Wi-Fi/4G restores.
              </p>
            </div>

            <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
              <span className="text-xs font-mono font-bold text-forest-600">ITERATION 2: FRICTIONLESS LANDLORD FLOW</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                Landlords Refused to Create Accounts or Download Apps
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Feedback:</strong> Landlords over 50 years old said &ldquo;I will not download another app or make passwords.&rdquo;
                <br />
                <strong>Solution:</strong> Created lightweight, zero-login tokenized web links and QR codes. Landlords can review and draw digital signatures in their mobile browser in under 60 seconds.
              </p>
            </div>

            <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
              <span className="text-xs font-mono font-bold text-forest-600">ITERATION 3: MULTILINGUAL ACCESSIBILITY</span>
              <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
                Local Pune Owners Prefer Marathi or Hindi Text
              </h4>
              <p className="text-xs text-ink-light dark:text-paper-300">
                <strong>Feedback:</strong> English-only contracts created suspicion with traditional Marathi-speaking property owners in Chinchwad and Nigdi.
                <br />
                <strong>Solution:</strong> Added a one-click working i18n toggle (English, हिन्दी, मराठी) translating all checklist terms, status stamps, and certificates.
              </p>
            </div>
          </div>

          <div className="luxury-card rounded-2xl p-8 text-center space-y-4">
            <h3 className="font-serif font-bold text-xl text-ink dark:text-paper-100">
              Experience the Solution Live
            </h3>
            <p className="text-xs text-ink-light max-w-md mx-auto">
              Explore the working prototype populated with real Pune inspection records and cryptographic proof.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-paper-100 font-mono text-xs font-bold uppercase tracking-wider hover:bg-forest-700 shadow"
            >
              <span>Go to Ledger Dashboard →</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
