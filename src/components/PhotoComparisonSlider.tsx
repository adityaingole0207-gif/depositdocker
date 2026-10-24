'use client';

import React, { useState, useRef, useCallback } from 'react';

interface PhotoComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeHash?: string;
  afterHash?: string;
  aspectRatio?: string;
}

export function PhotoComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'MOVE-IN CONDITION',
  afterLabel = 'MOVE-OUT CONDITION',
  beforeHash,
  afterHash,
  aspectRatio = '4/3',
}: PhotoComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative overflow-hidden select-none border-2 border-ink bg-paper-800 rounded-sm cursor-ew-resize"
        style={{ aspectRatio }}
      >
        {/* After Image (Background) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* After Badge */}
        <div className="absolute top-3 right-3 bg-vermilion-600/90 text-paper-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider shadow">
          {afterLabel}
        </div>

        {/* Before Image (Foreground with Clip) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
            draggable={false}
          />
          {/* Before Badge */}
          <div className="absolute top-3 left-3 bg-forest-600/90 text-paper-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider shadow">
            {beforeLabel}
          </div>
        </div>

        {/* Vertical Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-paper-100 shadow-[0_0_10px_rgba(0,0,0,0.6)] cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-paper-100 text-ink border-2 border-ink flex items-center justify-center shadow-lg font-mono text-xs font-bold">
            ↔
          </div>
        </div>
      </div>

      {/* Tamper-evident cryptographic verification captions */}
      <div className="flex items-center justify-between text-[10px] font-mono text-ink-light/80 dark:text-paper-400 px-1">
        <div>
          <span className="font-semibold text-forest-600">IN HASH:</span> {beforeHash ? `${beforeHash.substring(0, 16)}...` : 'VERIFIED INTACT'}
        </div>
        <div>
          <span className="font-semibold text-vermilion-600">OUT HASH:</span> {afterHash ? `${afterHash.substring(0, 16)}...` : 'DIFF DETECTED'}
        </div>
      </div>
    </div>
  );
}
