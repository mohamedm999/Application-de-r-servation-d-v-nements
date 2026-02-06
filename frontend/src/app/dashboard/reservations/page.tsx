'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, XCircle } from 'lucide-react';
import { reservationsApi } from '@/lib/api/reservations.api';
import { Reservation } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateShort } from '@/lib/utils/date';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationsApi.findMy({});
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    try {
      await reservationsApi.cancel(id);
      toast.success('Réservation annulée');
      fetchReservations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleDownloadTicket = async (id: string) => {
    try {
      const res = await reservationsApi.downloadTicket(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Erreur lors du téléchargement du billet');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Mes réservations
      </h1>

      {reservations.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-gray-500">Vous n&apos;avez aucune réservation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reservation.event?.title || 'Événement'}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>
                      {reservation.event?.date
                        ? formatDateShort(reservation.event.date)
                        : ''}
                    </span>
                    <span>·</span>
                    <span>
                      {reservation.numberOfSeats} place
                      {reservation.numberOfSeats > 1 ? 's' : ''}
                    </span>
                    <span>·</span>
                    <span>{reservation.event?.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={reservation.status} />

                  {reservation.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleDownloadTicket(reservation.id)}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                      title="Télécharger le billet"
                    >
                      <Download className="h-4 w-4" />
                      Billet
                    </button>
                  )}

                  {(reservation.status === 'PENDING' ||
                    reservation.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      title="Annuler"
                    >
                      <XCircle className="h-4 w-4" />
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
