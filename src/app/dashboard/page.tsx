'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingIcon,
  ShieldCheckIcon,
  CameraIcon,
  ScalesIcon,
  PlusIcon,
  AlertIcon,
  ArrowRightIcon,
  SealIcon,
} from '@/components/SvgIcons';
import { StatusStamp, StampType } from '@/components/StatusStamp';
import { useLanguage } from '@/components/LanguageContext';

interface RoomData {
  id: string;
  title: string;
  propertyType: string;
  address: string;
  area: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseStartDate: string;
  leaseEndDate: string;
  landlordName: string;
  landlordPhone: string;
  status: string;
  reports: Array<{
    id: string;
    type: string;
    status: string;
    reportNumber: string;
    lockedAt: string | null;
    chainedHash: string | null;
    shareToken: string;
    landlordStatus: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalDepositAtStake = rooms
    .filter((r) => r.status !== 'SETTLED' && r.status !== 'ARCHIVED')
    .reduce((sum, r) => sum + r.securityDeposit, 0);

  const activeRoomsCount = rooms.filter((r) => r.status !== 'ARCHIVED').length;
  const lockedCount = rooms.filter((r) => r.status === 'LOCKED' || r.status === 'COMPARED' || r.status === 'SETTLED').length;
  const settledCount = rooms.filter((r) => r.status === 'SETTLED').length;

  const today = new Date();
  const upcomingReminders = rooms.filter((r) => {
    if (r.status === 'SETTLED' || r.status === 'ARCHIVED') return false;
    const end = new Date(r.leaseEndDate);
    const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 45;
  });

  const filteredRooms = rooms.filter((room) => {
    if (activeTab !== 'ALL' && room.status !== activeTab) return false;
    if (selectedArea !== 'ALL' && room.area !== selectedArea) return false;
    return true;
  });

  const areas = ['ALL', 'Akurdi', 'Wakad', 'Hinjewadi', 'Nigdi', 'Chinchwad', 'Kothrud'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* ── Top Header Banner ── */}
      <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-paper-200 dark:border-paper-800">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-forest-700 dark:text-forest-400 font-medium mb-1">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>MUTUAL CONDITION REGISTRY • PUNE</span>
            </div>
            <h1 className="font-serif font-medium text-3xl sm:text-4xl text-ink dark:text-paper-100 tracking-tight">
              Tenant Inspection Ledger
            </h1>
            <p className="text-xs sm:text-sm text-ink-light dark:text-paper-400 mt-1 max-w-xl font-sans">
              Cryptographically verified move-in &amp; move-out condition records anchoring your tenancy deposits.
            </p>
          </div>

          <Link
            href="/rooms/new"
            className="btn-luxury inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-700 hover:bg-forest-600 text-paper-50 font-mono font-medium text-xs uppercase tracking-wider shadow-subtle transition-all"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>{t.newRoom}</span>
          </Link>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              {t.totalDepositAtStake}
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-ink dark:text-paper-100 tabular-nums">
              ₹{totalDepositAtStake.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-forest-700 dark:text-forest-400 block">
              15 rooms under protection
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              {t.activeRooms}
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-ink dark:text-paper-100 tabular-nums">
              {activeRoomsCount}
            </div>
            <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
              Across 6 Pune/PCMC hubs
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              {t.reportsLocked}
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-forest-700 dark:text-forest-400 tabular-nums">
              {lockedCount}
            </div>
            <span className="text-[10px] font-mono text-forest-700 dark:text-forest-400 block">
              SHA-256 sealed &amp; verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-light dark:text-paper-400">
              {t.settledRooms}
            </span>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-ink dark:text-paper-100 tabular-nums">
              {settledCount}
            </div>
            <span className="text-[10px] font-mono text-ink-light dark:text-paper-400 block">
              ₹0 unfair deductions
            </span>
          </div>
        </div>
      </div>

      {/* ── Lease Expiration Alert Banner ── */}
      {upcomingReminders.length > 0 && (
        <div className="luxury-card rounded-xl p-4 bg-vermilion-50/50 dark:bg-vermilion-950/20 border-vermilion-200 dark:border-vermilion-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-vermilion-100 dark:bg-vermilion-900/60 flex items-center justify-center text-vermilion-700 dark:text-vermilion-400 shrink-0">
              <AlertIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-vermilion-700 dark:text-vermilion-400 font-semibold block">
                UPCOMING LEASE EXPIRATION
              </span>
              <p className="text-xs text-ink dark:text-paper-200 font-sans">
                <strong>{upcomingReminders[0].title}</strong> lease ends on{' '}
                {new Date(upcomingReminders[0].leaseEndDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                . Capture your move-out photos before key handover.
              </p>
            </div>
          </div>
          <Link
            href={`/rooms/${upcomingReminders[0].id}/move-out`}
            className="btn-luxury whitespace-nowrap px-4 py-2 rounded-full bg-vermilion-700 text-paper-50 font-mono text-xs font-medium hover:bg-vermilion-600 uppercase tracking-wider transition-colors shrink-0"
          >
            Start Move-out →
          </Link>
        </div>
      )}

      {/* ── Pipeline Filters & Area Selection ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-medium text-2xl text-ink dark:text-paper-100">
              {t.statusPipeline}
            </h2>
            <p className="text-xs font-mono text-ink-light dark:text-paper-400 mt-0.5">
              Filter inspection dossiers by status or Pune locality
            </p>
          </div>

          {/* Area Selector Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-light dark:text-paper-400">Locality:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded-full border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-800 text-ink dark:text-paper-100 focus:outline-none"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a === 'ALL' ? 'All Pune Localities' : a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pipeline Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Records', count: rooms.length },
            { id: 'MOVE_IN_PENDING', label: t.moveInPending, count: rooms.filter((r) => r.status === 'MOVE_IN_PENDING').length },
            { id: 'LOCKED', label: t.locked, count: rooms.filter((r) => r.status === 'LOCKED').length },
            { id: 'COMPARED', label: t.compared, count: rooms.filter((r) => r.status === 'COMPARED').length },
            { id: 'SETTLED', label: t.settled, count: rooms.filter((r) => r.status === 'SETTLED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-mono text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-semibold shadow-subtle'
                  : 'text-ink-light dark:text-paper-400 hover:text-ink hover:bg-paper-100 dark:hover:bg-paper-800'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[10px]">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Room Dossiers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-paper-100/50 dark:bg-paper-800/40 animate-pulse border border-paper-200 dark:border-paper-800" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="luxury-card rounded-xl p-12 text-center space-y-3">
            <SealIcon className="w-8 h-8 text-paper-400 mx-auto" />
            <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-200">
              No rooms match the selected filter
            </h3>
            <p className="text-xs text-ink-light dark:text-paper-400 font-sans">
              Try selecting a different pipeline tab or resetting the locality filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredRooms.map((room) => {
              const moveInReport = room.reports.find((r) => r.type === 'MOVE_IN');
              const moveOutReport = room.reports.find((r) => r.type === 'MOVE_OUT');

              return (
                <div
                  key={room.id}
                  className="luxury-card rounded-xl flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Area pill & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-ink-light dark:text-paper-400">
                        {room.area} • {room.propertyType}
                      </span>
                      <StatusStamp type={room.status as StampType} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-medium text-lg text-ink dark:text-paper-100 leading-snug">
                        {room.title}
                      </h3>
                      <p className="text-xs text-ink-light dark:text-paper-400 line-clamp-1 font-sans">
                        {room.address}
                      </p>
                    </div>

                    {/* Financial Row */}
                    <div className="p-3 rounded-lg bg-paper-100/60 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-800 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-ink-light dark:text-paper-400">Deposit:</span>
                        <span className="font-serif font-bold text-sm text-ink dark:text-paper-100 tabular-nums">
                          ₹{room.securityDeposit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-[11px]">
                        <span className="text-ink-light dark:text-paper-400">Rent:</span>
                        <span className="text-ink dark:text-paper-200">
                          ₹{room.monthlyRent.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-paper-200 dark:border-paper-700">
                        <span className="text-ink-light dark:text-paper-400">Landlord:</span>
                        <span className="text-ink dark:text-paper-200">{room.landlordName}</span>
                      </div>
                    </div>

                    {/* Audit Metadata */}
                    <div className="text-[10px] font-mono text-ink-light dark:text-paper-400 space-y-1">
                      {moveInReport ? (
                        <div className="flex items-center justify-between">
                          <span>Move-In Certificate:</span>
                          <span className="text-forest-700 dark:text-forest-400 font-medium">
                            {moveInReport.reportNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="text-mustard-700 dark:text-mustard-400">
                          Move-in report pending capture
                        </div>
                      )}

                      {moveOutReport && (
                        <div className="flex items-center justify-between">
                          <span>Move-Out Audit:</span>
                          <span className="text-forest-700 dark:text-forest-400 font-medium">
                            {moveOutReport.reportNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 py-3.5 bg-paper-100/40 dark:bg-paper-800/30 border-t border-paper-200 dark:border-paper-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="text-xs font-mono font-medium text-ink dark:text-paper-200 hover:text-forest-700 dark:hover:text-forest-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Ledger Hub</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>

                    {room.status === 'MOVE_IN_PENDING' && (
                      <Link
                        href={`/rooms/${room.id}/move-in`}
                        className="btn-luxury px-3.5 py-1.5 rounded-full bg-forest-700 text-paper-50 font-mono text-[11px] font-medium uppercase tracking-wider hover:bg-forest-600 transition-colors"
                      >
                        Start Move-in →
                      </Link>
                    )}

                    {room.status === 'LOCKED' && (
                      <Link
                        href={`/rooms/${room.id}/move-out`}
                        className="btn-luxury px-3.5 py-1.5 rounded-full bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-mono text-[11px] font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        Move-out Walkthrough →
                      </Link>
                    )}

                    {room.status === 'COMPARED' && (
                      <Link
                        href={`/rooms/${room.id}/compare`}
                        className="btn-luxury px-3.5 py-1.5 rounded-full bg-vermilion-700 text-paper-50 font-mono text-[11px] font-medium uppercase tracking-wider hover:bg-vermilion-600 transition-colors"
                      >
                        Review Diff &amp; Dispute →
                      </Link>
                    )}

                    {room.status === 'SETTLED' && moveInReport && (
                      <Link
                        href={`/reports/${moveInReport.id}`}
                        className="btn-luxury px-3 py-1 rounded-full border border-forest-300 dark:border-forest-700 text-forest-700 dark:text-forest-300 font-mono text-[11px] font-medium uppercase tracking-wider hover:bg-forest-50 dark:hover:bg-forest-950 transition-colors"
                      >
                        Certificate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
