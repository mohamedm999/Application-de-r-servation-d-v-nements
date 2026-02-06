'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CreateEventRequest, Event } from '@/types';

const eventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  date: z.string().min(1, 'La date est requise'),
  location: z.string().min(1, 'Le lieu est requis'),
  capacity: z.coerce.number().min(1, 'Minimum 1 place').max(10000, 'Maximum 10000 places'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: CreateEventRequest) => Promise<void>;
  initialData?: Event;
}

export default function EventForm({ onSubmit, initialData }: EventFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          date: new Date(initialData.date).toISOString().slice(0, 16),
          location: initialData.location,
          capacity: initialData.capacity,
        }
      : undefined,
  });

  const handleFormSubmit = async (data: EventFormData) => {
    await onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="card max-w-2xl space-y-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Titre
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="input-field"
          placeholder="Titre de l'événement"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={5}
          className="input-field resize-none"
          placeholder="Décrivez votre événement..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
            Date et heure
          </label>
          <input
            id="date"
            type="datetime-local"
            {...register('date')}
            className="input-field"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
            Lieu
          </label>
          <input
            id="location"
            type="text"
            {...register('location')}
            className="input-field"
            placeholder="Lieu de l'événement"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="capacity" className="mb-1 block text-sm font-medium text-gray-700">
          Capacité (nombre de places)
        </label>
        <input
          id="capacity"
          type="number"
          {...register('capacity')}
          className="input-field w-40"
          min={1}
          max={10000}
          placeholder="50"
        />
        {errors.capacity && (
          <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : initialData
              ? 'Mettre à jour'
              : 'Créer l\'événement'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
