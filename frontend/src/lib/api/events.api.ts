import api from './axios';
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilters,
  DashboardStats,
  Reservation,
} from '@/types';

export interface EventsListResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}

export const eventsApi = {
  findAll: (filters?: EventFilters) =>
    api.get<EventsListResponse>('/events', { params: filters }).then((r) => r.data),

  findOne: (id: string) =>
    api.get<Event>(`/events/${id}`).then((r) => r.data),

  create: (data: CreateEventRequest) =>
    api.post<Event>('/events', data).then((r) => r.data),

  update: (id: string, data: UpdateEventRequest) =>
    api.patch<Event>(`/events/${id}`, data).then((r) => r.data),

  publish: (id: string) =>
    api.patch<Event>(`/events/${id}/publish`).then((r) => r.data),

  cancel: (id: string) =>
    api.patch<Event>(`/events/${id}/cancel`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/events/${id}`).then((r) => r.data),

  getReservations: (eventId: string) =>
    api.get<Reservation[]>(`/events/${eventId}/reservations`).then((r) => r.data),

  getStats: () =>
    api.get<DashboardStats>('/events/stats/dashboard').then((r) => r.data),
};
