'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AlertTriangle className="mb-4 h-16 w-16 text-red-500" />
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Une erreur est survenue
      </h2>
      <p className="mb-6 text-center text-gray-600">
        Quelque chose s&apos;est mal passé. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        Réessayer
      </button>
    </div>
  );
}
