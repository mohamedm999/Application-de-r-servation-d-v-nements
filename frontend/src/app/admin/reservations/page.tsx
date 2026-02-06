'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { reservationsApi } from '@/lib/api/reservations.api';
import { Reservation } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateShort } from '@/lib/utils/date';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reservationsApi.findAll({ page, limit: 10 });
      setReservations(res.reservations || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleConfirm = async (id: string) => {
    try {
      await reservationsApi.confirm(id);
      toast.success('Réservation confirmée');
      fetchReservations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleRefuse = async (id: string) => {
    if (!confirm('Voulez-vous vraiment refuser cette réservation ?')) return;
    try {
      await reservationsApi.refuse(id);
      toast.success('Réservation refusée');
      fetchReservations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleAdminCancel = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    try {
      await reservationsApi.adminCancel(id);
      toast.success('Réservation annulée');
      fetchReservations();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Gestion des réservations
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-gray-500">Aucune réservation.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Participant</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Événement</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Places</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {r.user
                        ? `${r.user.firstName} ${r.user.lastName}`
                        : r.userId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.event?.title || r.eventId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateShort(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.numberOfSeats}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {r.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleConfirm(r.id)}
                              className="rounded p-1.5 text-green-500 hover:bg-green-50 hover:text-green-700"
                              title="Confirmer"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRefuse(r.id)}
                              className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                              title="Refuser"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleAdminCancel(r.id)}
                            className="rounded p-1.5 text-orange-500 hover:bg-orange-50 hover:text-orange-700"
                            title="Annuler"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-4 text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
