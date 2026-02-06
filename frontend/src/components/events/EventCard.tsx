'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils/date';
import StatusBadge from '@/components/ui/StatusBadge';

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
}

export default function EventCard({ event, showStatus = false }: EventCardProps) {
  const spotsLeft = event.availableSeats;
  const isFull = spotsLeft <= 0;

  return (
    <Link href={`/events/${event.id}`} className="card group block transition-shadow hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Événement
        </span>
        {showStatus && <StatusBadge status={event.status} />}
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
        {event.title}
      </h3>

      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
        {event.description}
      </p>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {isFull ? (
              <span className="font-medium text-red-600">Complet</span>
            ) : (
              `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
