'use client';

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi, ReservationsListResponse } from '@/lib/api/reservations.api';
import { Reservation, ReservationFilters } from '@/types';
import toast from 'react-hot-toast';

export function useMyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reservationsApi.findMy();
      setReservations(data);
    } catch {
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const cancelReservation = useCallback(async (id: string) => {
    try {
      await reservationsApi.cancel(id);
      toast.success('Réservation annulée');
      await fetchReservations();
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  }, [fetchReservations]);

  const downloadTicket = useCallback(async (id: string) => {
    try {
      const response = await reservationsApi.downloadTicket(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement du billet');
    }
  }, []);

  return {
    reservations,
    isLoading,
    cancelReservation,
    downloadTicket,
    refetch: fetchReservations,
  };
}

export function useAdminReservations(initialFilters?: ReservationFilters) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ReservationFilters>(initialFilters || { page: 1, limit: 10 });

  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await reservationsApi.findAll(filters);
      setReservations(res.reservations);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateFilters = useCallback((newFilters: Partial<ReservationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }, []);

  return {
    reservations,
    total,
    totalPages,
    isLoading,
    filters,
    updateFilters,
    refetch: fetchReservations,
  };
}
