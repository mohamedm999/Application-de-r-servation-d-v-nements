import api from './axios';
import type { Reservation, CreateReservationRequest, ReservationFilters } from '@/types';

export interface ReservationsListResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  totalPages: number;
}

export const reservationsApi = {
  create: (data: CreateReservationRequest) =>
    api.post<Reservation>('/reservations', data).then((r) => r.data),

  findMy: (filters?: ReservationFilters) =>
    api.get<Reservation[]>('/reservations/my', { params: filters }).then((r) => r.data),

  findAll: (filters?: ReservationFilters) =>
    api.get<ReservationsListResponse>('/reservations', { params: filters }).then((r) => r.data),

  confirm: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/confirm`).then((r) => r.data),

  refuse: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/refuse`).then((r) => r.data),

  cancel: (id: string) =>
    api.delete(`/reservations/${id}`).then((r) => r.data),

  adminCancel: (id: string) =>
    api.delete(`/reservations/${id}/admin`).then((r) => r.data),

  downloadTicket: (id: string) =>
    api.get(`/reservations/${id}/ticket`, { responseType: 'blob' }),
};
