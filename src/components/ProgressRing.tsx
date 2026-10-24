import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercent?: boolean;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  className = '',
  showPercent = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-paper-300 dark:text-paper-700"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-forest-600 transition-all duration-500 ease-out"
          fill="none"
        />
      </svg>
      {showPercent && (
        <span className="absolute font-mono text-xs font-semibold text-ink dark:text-paper-100">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
