import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-blue-600">
            <Calendar className="h-5 w-5" />
            EventBooking
          </Link>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} EventBooking. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
