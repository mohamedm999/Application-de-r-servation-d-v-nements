// ─── User Types ──────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ──────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ─── Event Types ─────────────────────────────
export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  availableSeats: number;
  status: EventStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  reservations?: Reservation[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatus | string;
  fromDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Reservation Types ──────────────────────
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REFUSED = 'REFUSED',
  CANCELED = 'CANCELED',
}

export interface Reservation {
  id: string;
  eventId: string;
  userId: string;
  status: ReservationStatus;
  numberOfSeats: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  canceledAt: string | null;
  event?: Event;
  user?: User;
}

export interface CreateReservationRequest {
  eventId: string;
  numberOfSeats?: number;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  eventId?: string;
}

// ─── Dashboard Types ────────────────────────
export interface DashboardStats {
  upcomingEvents: number;
  totalReservations: number;
  fillRate: number;
  statusDistribution: {
    DRAFT: number;
    PUBLISHED: number;
    CANCELED: number;
  };
}
