import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClipWave - Connect Creators with Video Editors',
  description: 'The premier marketplace for short-form video editing. Connect content creators with skilled video editors for TikTok, Reels, and YouTube Shorts.',
  keywords: 'video editing, TikTok, YouTube Shorts, Instagram Reels, content creators, video editors',
  authors: [{ name: 'ClipWave' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clipwave.com',
    title: 'ClipWave - Connect Creators with Video Editors',
    description: 'The premier marketplace for short-form video editing services.',
    siteName: 'ClipWave',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipWave - Connect Creators with Video Editors',
    description: 'The premier marketplace for short-form video editing services.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}