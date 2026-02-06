'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { UserRole } from '@/types';
import { LogOut, Menu, X, Calendar, User, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Calendar className="h-6 w-6" />
          EventBooking
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Événements
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === UserRole.ADMIN ? (
                <Link href="/admin" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600">
                  <Shield className="h-4 w-4" />
                  Administration
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600">
                  <User className="h-4 w-4" />
                  Mon espace
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {user?.firstName} {user?.lastName}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-secondary text-sm">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm">
                Inscription
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/events" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
              Événements
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === UserRole.ADMIN ? (
                  <Link href="/admin" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Administration
                  </Link>
                ) : (
                  <Link href="/dashboard" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Mon espace
                  </Link>
                )}
                <button onClick={handleLogout} className="text-left text-sm font-medium text-red-600">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                  Connexion
                </Link>
                <Link href="/auth/register" className="text-sm font-medium text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
