'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Ticket, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { reservationsApi } from '@/lib/api/reservations.api';
import { Reservation } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateShort } from '@/lib/utils/date';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationsApi
      .findMy()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setReservations(list.slice(0, 5)); // Show only 5 most recent
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <User className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.firstName} !
          </h1>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <Link
          href="/events"
          className="card flex items-center gap-4 transition-shadow hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Explorer les événements</h3>
            <p className="text-sm text-gray-500">Découvrez les événements à venir</p>
          </div>
        </Link>
        <Link
          href="/dashboard/reservations"
          className="card flex items-center gap-4 transition-shadow hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <Ticket className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mes réservations</h3>
            <p className="text-sm text-gray-500">Gérez vos réservations</p>
          </div>
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Réservations récentes
          </h2>
          <Link
            href="/dashboard/reservations"
            className="text-sm text-blue-600 hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : reservations.length > 0 ? (
          <div className="divide-y">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {reservation.event?.title || 'Événement'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reservation.event?.date
                      ? formatDateShort(reservation.event.date)
                      : ''}{' '}
                    · {reservation.numberOfSeats} place
                    {reservation.numberOfSeats > 1 ? 's' : ''}
                  </p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">
            Aucune réservation pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
