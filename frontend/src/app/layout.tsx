import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthHydration from '@/components/layout/AuthHydration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EventBooking - Réservation d\'événements',
  description: 'Plateforme de réservation d\'événements en ligne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthHydration />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
