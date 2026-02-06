'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Ticket, Users } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils/cn';

const sidebarItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Événements', icon: Calendar },
  { href: '/admin/reservations', label: 'Réservations', icon: Ticket },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
