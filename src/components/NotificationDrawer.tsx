'use client';

import React, { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, AlertIcon, LockIcon } from '@/components/SvgIcons';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Notifications"
        className="relative p-2 text-ink hover:text-ink-dark dark:text-paper-100 hover:bg-paper-300/40 dark:hover:bg-paper-800 rounded-sm border border-paper-400 transition-colors"
      >
        <BellIcon className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-vermilion-600 text-paper-100 font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-paper-100 dark:bg-paper-900 border-2 border-ink dark:border-paper-400 shadow-paper-lg z-50 rounded-sm">
          <div className="p-3 bg-paper-200 dark:bg-paper-800 border-b border-paper-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-ink dark:text-paper-100">
                Official Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-vermilion-600 text-paper-100 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] font-mono text-ink-light dark:text-paper-400 hover:text-ink underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-paper-300 dark:divide-paper-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-ink-light dark:text-paper-400">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors ${
                    !n.isRead
                      ? 'bg-paper-50/80 dark:bg-paper-800/60 border-l-2 border-forest-600'
                      : 'hover:bg-paper-200/40 dark:hover:bg-paper-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {n.type === 'LOCK' && <LockIcon className="w-3.5 h-3.5 text-forest-600" />}
                      {n.type === 'ACKNOWLEDGMENT' && <CheckIcon className="w-3.5 h-3.5 text-forest-600" />}
                      {n.type === 'COMPARISON' && <CheckIcon className="w-3.5 h-3.5 text-mustard-600" />}
                      {n.type === 'REMINDER' && <AlertIcon className="w-3.5 h-3.5 text-vermilion-600" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-ink dark:text-paper-100">
                          {n.title}
                        </span>
                        <span className="text-[9px] font-mono text-ink-light/70 dark:text-paper-400">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-light dark:text-paper-300 leading-normal">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-paper-200 dark:bg-paper-800 border-t border-paper-400 text-center">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-mono text-ink-light hover:text-ink uppercase tracking-wider"
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
