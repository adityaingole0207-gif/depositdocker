'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@/components/SvgIcons';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  signerName?: string;
  label?: string;
}

export function SignaturePad({ onSave, signerName = '', label = 'Digital Attestation Signature' }: SignaturePadProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(signerName);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1B1A17';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing.current && canvasRef.current) {
      isDrawing.current = false;
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedName(e.target.value);
    onSave(`TYPED:${e.target.value}`);
  };

  return (
    <div className="border border-paper-400 bg-paper-50 dark:bg-paper-800 p-4 rounded-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-ink dark:text-paper-100">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`text-xs px-2.5 py-1 border font-mono transition-colors ${
              mode === 'draw'
                ? 'bg-ink text-paper-100 border-ink dark:bg-paper-100 dark:text-ink'
                : 'bg-paper-200 text-ink border-paper-400'
            }`}
          >
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`text-xs px-2.5 py-1 border font-mono transition-colors ${
              mode === 'type'
                ? 'bg-ink text-paper-100 border-ink dark:bg-paper-100 dark:text-ink'
                : 'bg-paper-200 text-ink border-paper-400'
            }`}
          >
            Type Legal Name
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="relative border-2 border-dashed border-paper-400 bg-white dark:bg-paper-900 rounded-sm">
          <canvas
            ref={canvasRef}
            width={460}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-[130px] touch-none cursor-crosshair"
          />
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-ink-light/50 pointer-events-none">
            Sign inside the box • Touches & stylus supported
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 bg-paper-200 dark:bg-paper-800 border border-paper-400 hover:bg-paper-300 text-ink dark:text-paper-200"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={handleTypedChange}
            placeholder="Type your full legal name"
            className="w-full px-3 py-2 text-lg font-serif italic border border-paper-400 bg-white dark:bg-paper-900 text-ink dark:text-paper-100 focus:outline-none focus:border-ink"
          />
          <p className="text-[10px] font-mono text-ink-light/70 dark:text-paper-400">
            Attestation: Typing your legal name constitutes an electronic signature under the Information Technology Act, 2000.
          </p>
        </div>
      )}
    </div>
  );
}
