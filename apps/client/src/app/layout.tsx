import { type ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import App from 'app/App';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import { plusJakartaSans, splineSansMono } from 'theme/typography';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Aurora',
    template: '%s | Aurora',
  },
  description: 'Enterprise-grade Admin Dashboard and Web App Template',
  keywords: ['admin', 'dashboard', 'template', 'enterprise', 'web app'],
  authors: [{ name: 'Aurora Team' }],
  creator: 'Aurora',
  publisher: 'Aurora',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Aurora - Enterprise Admin Dashboard',
    description: 'Enterprise-grade Admin Dashboard and Web App Template',
    siteName: 'Aurora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurora - Enterprise Admin Dashboard',
    description: 'Enterprise-grade Admin Dashboard and Web App Template',
    creator: '@aurora',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${plusJakartaSans.className} ${splineSansMono.className}`}
    >
      <body>
        <InitColorSchemeScript attribute="data-aurora-color-scheme" modeStorageKey="aurora-mode" />
        <AppRouterCacheProvider>
          <SettingsProvider>
            <LocalizationProvider>
              <ThemeProvider>
                <NotistackProvider>
                  <BreakpointsProvider>
                    <App>{children}</App>
                  </BreakpointsProvider>
                </NotistackProvider>
              </ThemeProvider>
            </LocalizationProvider>
          </SettingsProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
