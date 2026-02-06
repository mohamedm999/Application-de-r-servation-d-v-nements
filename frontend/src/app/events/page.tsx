'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { eventsApi } from '@/lib/api/events.api';
import { Event } from '@/types';
import EventCard from '@/components/events/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsApi.findAll({
        page,
        limit: 9,
        search: search || undefined,
        status: 'PUBLISHED',
      });
      setEvents(res.events || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // No need to call fetchEvents() here - useEffect will trigger it
    // when page changes back to 1 (or if already 1, the search dependency handles it)
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Événements</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtrer
        </button>
      </form>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
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
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">Aucun événement trouvé.</p>
        </div>
      )}
    </div>
  );
}
