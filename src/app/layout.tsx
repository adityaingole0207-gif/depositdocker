import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar, MobileBottomNav } from '@/components/Navbar';
import { LanguageProvider } from '@/components/LanguageContext';
import { OfflineUploadQueue } from '@/components/OfflineUploadQueue';

export const metadata: Metadata = {
  title: 'DepositLocker • Tamper-Evident Security Deposit Protection for Tenants',
  description:
    'Document room condition at move-in and move-out with SHA-256 tamper-evident photo proof. Automatic diffing, fair depreciation calculation, and landlord dispute helper for Pune & PCMC tenants.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#F4EFE6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DepositLocker" />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-paper-400 selection:text-ink">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-10">{children}</main>
          <MobileBottomNav />
          <OfflineUploadQueue />
        </LanguageProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
