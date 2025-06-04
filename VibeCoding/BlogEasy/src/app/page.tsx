'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers le dashboard
    router.push('/dashboard');
  }, [router]);

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de l'application...</p>
      </div>
    </div>
  );
}
