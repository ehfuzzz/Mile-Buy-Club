import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const THEME_COLOR = '#0f172a';

export const metadata: Metadata = {
  title: {
    default: 'Mile Buy Club',
    template: '%s | Mile Buy Club',
  },
  description: 'Join the premier hub for monitoring award travel deals and mileage arbitrage.',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: THEME_COLOR,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/api/pwa-icon/192', sizes: '192x192' },
      { url: '/api/pwa-icon/512', sizes: '512x512' },
    ],
    apple: [{ url: '/api/pwa-icon/apple', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] antialiased font-sans',
          inter.variable,
          sora.variable
        )}
      >
        <AuthProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
