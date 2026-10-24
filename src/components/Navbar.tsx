'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SealIcon,
  BuildingIcon,
  ChartIcon,
  BookOpenIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from '@/components/SvgIcons';
import { useLanguage } from '@/components/LanguageContext';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { LanguageCode } from '@/lib/i18n';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('dl_theme') === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dl_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dl_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
  };

  const navLinks = [
    { href: '/dashboard', label: t.dashboard, icon: BuildingIcon },
    { href: '/insights', label: t.insights, icon: ChartIcon },
    { href: '/about', label: t.designThinking, icon: BookOpenIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-50/90 dark:bg-paper-900/90 backdrop-blur-md border-b border-paper-300 dark:border-paper-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Editorial Mark */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full border border-paper-400 dark:border-paper-700 bg-paper-100 dark:bg-paper-800 flex items-center justify-center text-forest-600 dark:text-forest-400 group-hover:border-forest-600 transition-colors">
              <SealIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-lg text-ink dark:text-paper-100 tracking-tight">
                  DepositLocker
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-paper-300 dark:border-paper-700 text-ink-light dark:text-paper-400">
                  Pune Ledger
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1.5 bg-paper-100/60 dark:bg-paper-800/60 p-1 rounded-full border border-paper-300/60 dark:border-paper-700/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-full transition-all ${
                  isActive
                    ? 'bg-paper-50 dark:bg-paper-900 text-ink dark:text-paper-100 font-semibold shadow-subtle border border-paper-300 dark:border-paper-700'
                    : 'text-ink-light dark:text-paper-400 hover:text-ink dark:hover:text-paper-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: i18n, Theme, Notifications, User */}
        <div className="flex items-center gap-2.5">
          {/* i18n Language Selector */}
          <div className="flex border border-paper-300 dark:border-paper-700 rounded-full p-0.5 text-[11px] font-mono bg-paper-100/60 dark:bg-paper-800/60">
            {(['en', 'hi', 'mr'] as LanguageCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  language === code
                    ? 'bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink font-semibold'
                    : 'text-ink-light dark:text-paper-400 hover:text-ink dark:hover:text-paper-200'
                }`}
              >
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 text-ink-light dark:text-paper-300 hover:text-ink dark:hover:text-paper-100 border border-paper-300 dark:border-paper-700 rounded-full hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
          >
            {isDark ? <SunIcon className="w-4 h-4 text-mustard-500" /> : <MoonIcon className="w-4 h-4" />}
          </button>

          {/* In-app Notification Center Drawer */}
          <NotificationDrawer />

          {/* User profile dropdown or Login link */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-paper-300 dark:border-paper-700">
              <div className="hidden sm:block text-right">
                <div className="font-mono text-xs font-semibold text-ink dark:text-paper-100">
                  {user.name.split(' ')[0]}
                </div>
                <div className="font-mono text-[10px] text-ink-light dark:text-paper-400">
                  Pune Tenant
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out of DepositLocker"
                className="w-8 h-8 rounded-full border border-paper-300 dark:border-paper-700 bg-paper-100 dark:bg-paper-800 flex items-center justify-center text-ink-light dark:text-paper-300 hover:text-vermilion-600 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-full bg-ink text-paper-50 dark:bg-paper-100 dark:text-ink hover:opacity-90 transition-opacity"
            >
              {t.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navLinks = [
    { href: '/dashboard', label: t.dashboard, icon: BuildingIcon },
    { href: '/insights', label: t.insights, icon: ChartIcon },
    { href: '/about', label: t.designThinking, icon: BookOpenIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-50/95 dark:bg-paper-900/95 backdrop-blur-md border-t border-paper-300 dark:border-paper-800 py-2.5 px-4 flex items-center justify-around shadow-luxury">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              isActive
                ? 'text-forest-700 dark:text-forest-400 font-semibold'
                : 'text-ink-light dark:text-paper-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
