'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Users, Shield, ArrowRight } from 'lucide-react';
import { eventsApi } from '@/lib/api/events.api';
import { Event } from '@/types';
import EventCard from '@/components/events/EventCard';

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi
      .findAll({ page: 1, limit: 6, status: 'PUBLISHED' })
      .then((res) => setUpcomingEvents(res.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Découvrez et réservez des{' '}
              <span className="text-yellow-300">événements</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Trouvez les meilleurs événements près de chez vous. Réservez en
              quelques clics et recevez votre billet instantanément.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/events"
                className="btn-primary inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow hover:bg-blue-50"
              >
                Explorer les événements
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white/10"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Pourquoi EventBooking ?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Événements variés</h3>
              <p className="text-gray-600">
                Concerts, conférences, ateliers et plus encore. Trouvez
                l&apos;événement qui vous correspond.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Réservation facile</h3>
              <p className="text-gray-600">
                Réservez votre place en quelques clics. Confirmation instantanée
                et billet dématérialisé.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">100% sécurisé</h3>
              <p className="text-gray-600">
                Vos données sont protégées. Annulation flexible et service
                client réactif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Événements à venir
            </h2>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Aucun événement à venir pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
