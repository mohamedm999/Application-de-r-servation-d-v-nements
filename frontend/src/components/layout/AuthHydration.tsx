'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';

export default function AuthHydration() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return null;
}
