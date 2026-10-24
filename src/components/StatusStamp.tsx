import React from 'react';
import { clsx } from 'clsx';

export type StampType =
  | 'LOCKED'
  | 'VERIFIED'
  | 'INTACT'
  | 'POSSIBLE_DAMAGE'
  | 'SETTLED'
  | 'PRE_EXISTING'
  | 'NORMAL_WEAR'
  | 'MOVE_IN_PENDING'
  | 'MOVE_OUT_PENDING'
  | 'COMPARED'
  | 'DRAFT';

interface StatusStampProps {
  type: StampType;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export function StatusStamp({ type, size = 'md', className }: StatusStampProps) {
  let text = '';
  let colorClasses = '';
  let dotColor = '';

  switch (type) {
    case 'LOCKED':
      text = 'Sealed & Locked';
      colorClasses = 'text-forest-700 bg-forest-50 border-forest-200 dark:bg-forest-950/40 dark:text-forest-300 dark:border-forest-800/60';
      dotColor = 'bg-forest-600';
      break;
    case 'VERIFIED':
    case 'INTACT':
      text = 'Verified Intact';
      colorClasses = 'text-forest-700 bg-forest-50 border-forest-200 dark:bg-forest-950/40 dark:text-forest-300 dark:border-forest-800/60';
      dotColor = 'bg-forest-600';
      break;
    case 'POSSIBLE_DAMAGE':
      text = 'Possible Damage';
      colorClasses = 'text-vermilion-700 bg-vermilion-50 border-vermilion-200 dark:bg-vermilion-950/40 dark:text-vermilion-300 dark:border-vermilion-800/60';
      dotColor = 'bg-vermilion-500';
      break;
    case 'PRE_EXISTING':
      text = 'Pre-Existing Wear';
      colorClasses = 'text-mustard-700 bg-mustard-50 border-mustard-200 dark:bg-mustard-950/40 dark:text-mustard-300 dark:border-mustard-800/60';
      dotColor = 'bg-mustard-500';
      break;
    case 'NORMAL_WEAR':
      text = 'Normal Wear & Tear';
      colorClasses = 'text-paper-700 bg-paper-100 border-paper-300 dark:bg-paper-800 dark:text-paper-300 dark:border-paper-700';
      dotColor = 'bg-paper-500';
      break;
    case 'SETTLED':
      text = 'Deposit Settled';
      colorClasses = 'text-forest-800 bg-forest-100/70 border-forest-300 dark:bg-forest-900/40 dark:text-forest-200 dark:border-forest-700';
      dotColor = 'bg-forest-700';
      break;
    case 'MOVE_IN_PENDING':
      text = 'Move-In Pending';
      colorClasses = 'text-mustard-700 bg-mustard-50 border-mustard-200 dark:bg-mustard-950/40 dark:text-mustard-300 dark:border-mustard-800/60';
      dotColor = 'bg-mustard-500';
      break;
    case 'MOVE_OUT_PENDING':
      text = 'Move-Out Due';
      colorClasses = 'text-vermilion-700 bg-vermilion-50 border-vermilion-200 dark:bg-vermilion-950/40 dark:text-vermilion-300 dark:border-vermilion-800/60';
      dotColor = 'bg-vermilion-500';
      break;
    case 'COMPARED':
      text = 'Comparison Ready';
      colorClasses = 'text-ink-light bg-paper-100 border-paper-300 dark:bg-paper-800 dark:text-paper-200 dark:border-paper-700';
      dotColor = 'bg-paper-600';
      break;
    default:
      text = type.replace(/_/g, ' ');
      colorClasses = 'text-ink-light bg-paper-100 border-paper-300';
      dotColor = 'bg-paper-400';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider gap-1.5',
    md: 'text-[11px] px-2.5 py-1 tracking-wider gap-1.5',
    lg: 'text-xs px-3.5 py-1.5 tracking-wider gap-2',
  }[size];

  return (
    <span
      className={clsx(
        'inline-flex items-center select-none font-mono font-medium uppercase rounded-full border transition-colors',
        colorClasses,
        sizeClasses,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      <span>{text}</span>
    </span>
  );
}
