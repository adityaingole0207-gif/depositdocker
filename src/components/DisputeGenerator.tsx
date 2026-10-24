'use client';

import React, { useState } from 'react';
import { WhatsAppIcon, CopyIcon, DocumentIcon, CheckIcon, AlertIcon } from '@/components/SvgIcons';

interface DisputeGeneratorProps {
  roomTitle: string;
  landlordName: string;
  landlordPhone?: string;
  depositAmount: number;
  fairDeduction: number;
  recommendedRefund: number;
  reportNumber: string;
  reportVerifyUrl: string;
  itemsList: Array<{
    name: string;
    status: string;
    cost: number;
    notes?: string;
  }>;
}

export function DisputeGenerator({
  roomTitle,
  landlordName,
  landlordPhone = '',
  depositAmount,
  fairDeduction,
  recommendedRefund,
  reportNumber,
  reportVerifyUrl,
  itemsList,
}: DisputeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'legalGuide' | 'statute'>('message');

  // Breakdown text
  const breakdownText = itemsList
    .map(
      (item) =>
        `• ${item.name}: ${item.status === 'PRE_EXISTING' ? 'Pre-existing condition (₹0)' : item.status === 'NORMAL_WEAR' ? 'Normal domestic wear & tear (₹0)' : `Fair repair: ₹${item.cost.toLocaleString('en-IN')}`}`
    )
    .join('\n');

  const defaultDraft = `Respected ${landlordName || 'Landlord'},

Hope you are doing well.

Regarding the refund of my security deposit of ₹${depositAmount.toLocaleString('en-IN')} for ${roomTitle}:

I have compiled the comprehensive Move-In vs Move-Out condition audit recorded through DepositLocker (Official Certificate No: ${reportNumber}). Each item has timestamped, tamper-evident photo proof sealed with SHA-256 hashes.

Item-by-item breakdown:
${breakdownText}

Summary:
- Total Security Deposit Paid: ₹${depositAmount.toLocaleString('en-IN')}
- Fair Depreciated Deductions: ₹${fairDeduction.toLocaleString('en-IN')}
- Recommended Net Refund: ₹${recommendedRefund.toLocaleString('en-IN')}

You can inspect the full cryptographic audit report and photos here:
${reportVerifyUrl}

Under standard tenancy guidelines and Model Tenancy Act principles, normal wear and tear resulting from ordinary habitation is the owner's maintenance responsibility, while pre-existing flaws noted at move-in cannot be debited to the tenant.

Kindly arrange for the refund of ₹${recommendedRefund.toLocaleString('en-IN')} via UPI / bank transfer at your earliest convenience.

Thank you for your cooperation and understanding.

Warm regards,
Tenant`;

  const [message, setMessage] = useState(defaultDraft);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const cleanPhone = landlordPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Security Deposit Refund - ${roomTitle} [${reportNumber}]`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="border-2 border-ink bg-paper-100 dark:bg-paper-900 rounded-sm overflow-hidden shadow-paper">
      {/* Ledger Header */}
      <div className="bg-paper-200 dark:bg-paper-800 border-b border-paper-400 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-forest-600 font-bold">
            STATUTORY CONCILIATION & RESOLUTION
          </span>
          <h3 className="font-serif text-lg font-bold text-ink dark:text-paper-100">
            Landlord Dispute & Deposit Recovery Helper
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-paper-400 rounded-sm overflow-hidden text-xs font-mono">
          <button
            onClick={() => setActiveTab('message')}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === 'message'
                ? 'bg-ink text-paper-100 font-bold'
                : 'bg-paper-100 text-ink hover:bg-paper-200 dark:bg-paper-800 dark:text-paper-200'
            }`}
          >
            Draft Notice
          </button>
          <button
            onClick={() => setActiveTab('legalGuide')}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === 'legalGuide'
                ? 'bg-ink text-paper-100 font-bold'
                : 'bg-paper-100 text-ink hover:bg-paper-200 dark:bg-paper-800 dark:text-paper-200'
            }`}
          >
            Step-by-Step Escalation
          </button>
          <button
            onClick={() => setActiveTab('statute')}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === 'statute'
                ? 'bg-ink text-paper-100 font-bold'
                : 'bg-paper-100 text-ink hover:bg-paper-200 dark:bg-paper-800 dark:text-paper-200'
            }`}
          >
            Legal Precedents
          </button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'message' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ink-light dark:text-paper-400">
                Polite, legally factual draft citing Certificate <strong>{reportNumber}</strong>. You may edit before sending:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border border-ink bg-paper-50 dark:bg-paper-800 hover:bg-paper-200 text-ink dark:text-paper-100 transition-colors"
                >
                  {copied ? <CheckIcon className="w-3.5 h-3.5 text-forest-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Text'}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  Send WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleEmail}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border border-ink bg-ink text-paper-100 hover:bg-ink-light transition-colors"
                >
                  Send Email
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-paper-400 bg-white dark:bg-paper-950 text-ink dark:text-paper-100 leading-relaxed focus:outline-none focus:border-ink resize-y rounded-sm"
            />
          </div>
        )}

        {activeTab === 'legalGuide' && (
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
              What to Do If Landlord Refuses or Unilaterally Deducts Deposit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-forest-600 text-paper-100 font-mono text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h5 className="font-serif font-bold text-sm text-ink dark:text-paper-100">
                  Step 1: Informal Proof Submission
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 leading-relaxed">
                  Send the DepositLocker PDF and verification link via WhatsApp and registered email. Most reasonable landlords concede within 48 hours once they realize the tenant holds timestamped photo proof and exact pre-existing records.
                </p>
              </div>

              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-mustard-600 text-paper-100 font-mono text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h5 className="font-serif font-bold text-sm text-ink dark:text-paper-100">
                  Step 2: National Consumer Helpline (NCH)
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 leading-relaxed">
                  Call <strong>1915</strong> or register a grievance on <em>consumerhelpline.gov.in</em> against unfair trade practice and breach of deposit custody. Many landlords take notice when a government docket number is generated.
                </p>
              </div>

              <div className="border border-paper-400 p-4 bg-paper-50 dark:bg-paper-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-vermilion-600 text-paper-100 font-mono text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h5 className="font-serif font-bold text-sm text-ink dark:text-paper-100">
                  Step 3: Formal Legal Notice & Consumer Court
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 leading-relaxed">
                  Issue a 15-day legal notice drafted by an advocate under Section 439 & Civil Procedure Code. With DepositLocker’s SHA-256 evidence chain, you can claim 18% p.a. interest plus legal litigation damages under Consumer Protection Act 2019.
                </p>
              </div>
            </div>

            <div className="p-3 bg-paper-200 dark:bg-paper-800 border-l-4 border-forest-600 text-xs font-mono text-ink-light dark:text-paper-300">
              <strong>General Guidance Note:</strong> This helper provides informational guidance based on Indian tenant rights and the Model Tenancy Act guidelines. For complex disputes involving large commercial deposits, consulting an advocate registered with the Bar Council of Maharashtra & Goa is recommended.
            </div>
          </div>
        )}

        {activeTab === 'statute' && (
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-ink dark:text-paper-100">
              Key Statutory Provisions & Tenancy Precedents
            </h4>

            <div className="space-y-3">
              <div className="border border-paper-400 p-3 bg-paper-50 dark:bg-paper-800">
                <h5 className="font-mono text-xs font-bold text-forest-600 uppercase">
                  Model Tenancy Act (MTA), Section 11 & Schedule II
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
                  Specifies that routine repainting, whitewashing, and structural wear from aging is the landlord’s statutory obligation. Tenants are only liable for willful or negligent damages proven with visual documentation.
                </p>
              </div>

              <div className="border border-paper-400 p-3 bg-paper-50 dark:bg-paper-800">
                <h5 className="font-mono text-xs font-bold text-forest-600 uppercase">
                  Section 65B of Indian Evidence Act
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
                  Governs the admissibility of electronic records. DepositLocker satisfies 65B prerequisites by capturing cryptographic SHA-256 digests, device lastModified headers, and immutable time anchors at the instant of capture.
                </p>
              </div>

              <div className="border border-paper-400 p-3 bg-paper-50 dark:bg-paper-800">
                <h5 className="font-mono text-xs font-bold text-forest-600 uppercase">
                  Consumer Protection Act 2019 - Deficiency in Housing Services
                </h5>
                <p className="text-xs text-ink-light dark:text-paper-300 mt-1">
                  District Consumer Disputes Redressal Commissions (DCDRC) have consistently held that withholding a tenant’s security deposit without verified repair receipts and itemized proof constitutes severe deficiency in service, entitling the tenant to full refund plus interest.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
