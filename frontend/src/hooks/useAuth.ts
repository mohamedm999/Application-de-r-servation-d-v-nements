'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { UserRole } from '@/types';

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.user?.role === UserRole.ADMIN,
    isParticipant: store.user?.role === UserRole.PARTICIPANT,
    login: store.login,
    register: store.register,
    logout: store.logout,
    loadUser: store.loadUser,
  };
}
