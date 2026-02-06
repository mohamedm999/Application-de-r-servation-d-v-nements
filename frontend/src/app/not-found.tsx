import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <FileQuestion className="mb-4 h-16 w-16 text-gray-400" />
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Page introuvable
      </h2>
      <p className="mb-6 text-center text-gray-600">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="btn-primary">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
