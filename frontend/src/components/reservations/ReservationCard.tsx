'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { Reservation, ReservationStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';
import StatusBadge from '@/components/ui/StatusBadge';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onDownloadTicket?: (id: string) => void;
  isLoading?: boolean;
}

export default function ReservationCard({
  reservation,
  onCancel,
  onDownloadTicket,
  isLoading,
}: ReservationCardProps) {
  const event = reservation.event;
  const canCancel =
    reservation.status === ReservationStatus.PENDING ||
    reservation.status === ReservationStatus.CONFIRMED;

  const canDownload = reservation.status === ReservationStatus.CONFIRMED;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {event && (
            <Link
              href={`/events/${event.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {event.title}
            </Link>
          )}
          <div className="mt-1">
            <StatusBadge status={reservation.status} />
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <span>{reservation.numberOfSeats} place{reservation.numberOfSeats > 1 ? 's' : ''}</span>
        </div>
      </div>

      {event && (
        <div className="mt-3 space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {canDownload && onDownloadTicket && (
          <button
            onClick={() => onDownloadTicket(reservation.id)}
            disabled={isLoading}
            className="btn-primary text-xs"
          >
            <Ticket className="mr-1 h-3 w-3" />
            Télécharger le billet
          </button>
        )}
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(reservation.id)}
            disabled={isLoading}
            className="btn-danger text-xs"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
