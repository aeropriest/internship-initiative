'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function ApplicationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Manatal applications page
    router.push('/applications/manatal');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader className="h-12 w-12 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600">Redirecting to applications...</p>
    </div>
  );
}
