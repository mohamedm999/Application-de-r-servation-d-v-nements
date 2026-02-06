'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events.api';
import { reservationsApi } from '@/lib/api/reservations.api';
import { Event } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatDate } from '@/lib/utils/date';
import StatusBadge from '@/components/ui/StatusBadge';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    if (params.id) {
      eventsApi
        .findOne(params.id as string)
        .then((event) => setEvent(event))
        .catch(() => {
          toast.error('Événement introuvable');
          router.push('/events');
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour réserver');
      router.push('/auth/login');
      return;
    }
    if (!event) return;

    setReserving(true);
    try {
      await reservationsApi.create({ eventId: event.id, numberOfSeats: seats });
      toast.success('Réservation effectuée avec succès !');
      // Refresh event data
      const updated = await eventsApi.findOne(event.id);
      setEvent(updated);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Échec de la réservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.availableSeats <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="card">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <StatusBadge status={event.status} className="mt-2" />
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(event.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <MapPin className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Lieu</p>
              <p className="font-medium">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Places</p>
              <p className="font-medium">
                {event.availableSeats} / {event.capacity} disponibles
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-line text-gray-700">{event.description}</p>
        </div>

        {/* Reservation Box */}
        {event.status === 'PUBLISHED' && !isPast && (
          <div className="rounded-lg border-2 border-blue-100 bg-blue-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
              Réserver cet événement
            </h3>
            {isFull ? (
              <p className="font-medium text-red-600">
                Cet événement est complet. Aucune place disponible.
              </p>
            ) : (
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label htmlFor="seats" className="mb-1 block text-sm font-medium text-blue-800">
                    Nombre de places
                  </label>
                  <input
                    id="seats"
                    type="number"
                    min={1}
                    max={event.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field w-24"
                  />
                </div>
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="btn-primary disabled:opacity-50"
                >
                  {reserving ? 'Réservation...' : 'Réserver maintenant'}
                </button>
              </div>
            )}
          </div>
        )}

        {isPast && (
          <p className="rounded-lg bg-gray-100 p-4 text-center text-gray-600">
            Cet événement est passé.
          </p>
        )}
      </div>
    </div>
  );
}
