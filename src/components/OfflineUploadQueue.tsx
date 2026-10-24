'use client';

import React, { useState, useEffect } from 'react';
import { AlertIcon, CheckIcon } from '@/components/SvgIcons';

export interface QueuedUpload {
  id: string;
  itemId: string;
  file: File;
  hash: string;
  timestamp: string;
}

export function OfflineUploadQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && queueCount === 0) return null;

  return (
    <div
      className={`fixed bottom-16 sm:bottom-4 right-4 z-40 max-w-sm p-3 border-2 shadow-paper-lg transition-all ${
        !isOnline
          ? 'bg-mustard-50 border-mustard-600 text-mustard-900'
          : 'bg-forest-50 border-forest-600 text-forest-900'
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-mono">
        {!isOnline ? (
          <>
            <AlertIcon className="w-4 h-4 text-mustard-600 animate-pulse" />
            <div>
              <p className="font-bold">Offline Mode Active</p>
              <p className="text-[10px] text-mustard-800">
                Photos are hashed locally and queued. They will sync automatically when connection restores.
              </p>
            </div>
          </>
        ) : (
          <>
            <CheckIcon className="w-4 h-4 text-forest-600" />
            <div>
              <p className="font-bold">Connection Restored</p>
              <p className="text-[10px] text-forest-800">
                Evidence uploads synchronizing...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
