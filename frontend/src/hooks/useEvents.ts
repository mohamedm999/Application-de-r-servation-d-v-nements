'use client';

import { useState, useEffect, useCallback } from 'react';
import { eventsApi, EventsListResponse } from '@/lib/api/events.api';
import { Event, EventFilters } from '@/types';
import toast from 'react-hot-toast';

export function useEvents(initialFilters?: EventFilters) {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>(initialFilters || { page: 1, limit: 9 });

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await eventsApi.findAll(filters);
      setEvents(res.events);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    events,
    total,
    totalPages,
    isLoading,
    filters,
    updateFilters,
    setPage,
    refetch: fetchEvents,
  };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const data = await eventsApi.findOne(id);
        setEvent(data);
      } catch {
        setError('Événement introuvable');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  return { event, isLoading, error };
}
