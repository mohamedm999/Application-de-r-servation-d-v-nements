'use client';

import { Event } from '@/types';
import EventCard from './EventCard';
import EmptyState from '@/components/ui/EmptyState';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: Event[];
  showStatus?: boolean;
  emptyMessage?: string;
}

export default function EventList({
  events,
  showStatus = false,
  emptyMessage = 'Aucun événement trouvé',
}: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyMessage}
        description="Essayez de modifier vos filtres ou revenez plus tard."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} showStatus={showStatus} />
      ))}
    </div>
  );
}
