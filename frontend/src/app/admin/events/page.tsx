'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Send, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events.api';
import { Event } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateShort } from '@/lib/utils/date';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsApi.findAll({ page, limit: 10 });
      setEvents(res.events || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePublish = async (id: string) => {
    try {
      await eventsApi.publish(id);
      toast.success('Événement publié');
      fetchEvents();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cet événement ?')) return;
    try {
      await eventsApi.cancel(id);
      toast.success('Événement annulé');
      fetchEvents();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    try {
      await eventsApi.delete(id);
      toast.success('Événement supprimé');
      fetchEvents();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des événements
        </h1>
        <Link href="/admin/events/create" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-gray-500">Aucun événement.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Titre</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Lieu</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Places</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateShort(event.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.availableSeats}/{event.capacity}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/events/${event.id}`}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {event.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(event.id)}
                            className="rounded p-1.5 text-green-500 hover:bg-green-50 hover:text-green-700"
                            title="Publier"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {event.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleCancel(event.id)}
                            className="rounded p-1.5 text-orange-500 hover:bg-orange-50 hover:text-orange-700"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {event.status === 'DRAFT' && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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
