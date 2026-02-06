'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events.api';
import { Event, CreateEventRequest } from '@/types';
import EventForm from '@/components/events/EventForm';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      eventsApi
        .findOne(params.id as string)
        .then((event) => setEvent(event))
        .catch(() => {
          toast.error('Événement introuvable');
          router.push('/admin/events');
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  const handleUpdate = async (data: CreateEventRequest) => {
    if (!event) return;
    try {
      await eventsApi.update(event.id, data);
      toast.success('Événement mis à jour');
      router.push('/admin/events');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Modifier l&apos;événement
      </h1>
      <EventForm onSubmit={handleUpdate} initialData={event} />
    </div>
  );
}
