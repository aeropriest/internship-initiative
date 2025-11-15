'use client';

import { useEffect } from 'react';
import { initializeFirebase } from '../services/firebase';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Firebase when the component mounts (client-side only)
    initializeFirebase();
  }, []);

  return <>{children}</>;
}
