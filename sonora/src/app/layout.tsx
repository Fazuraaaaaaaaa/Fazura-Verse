import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'FAZURA MUSIC - Web Player',
  description: 'Spotify-style web music streaming player powered by Next.js and YouTube Music.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased selection:bg-[#1DB954] selection:text-black">
        <QueryProvider>
          <MainLayout>{children}</MainLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
