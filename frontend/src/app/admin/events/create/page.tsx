'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events.api';
import { CreateEventRequest } from '@/types';
import EventForm from '@/components/events/EventForm';

export default function CreateEventPage() {
  const router = useRouter();

  const handleCreate = async (data: CreateEventRequest) => {
    try {
      await eventsApi.create(data);
      toast.success('Événement créé avec succès');
      router.push('/admin/events');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
      throw err;
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Créer un événement
      </h1>
      <EventForm onSubmit={handleCreate} />
    </div>
  );
}
