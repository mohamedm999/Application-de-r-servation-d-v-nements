'use client';

import { useEffect, useState } from 'react';
import { Calendar, Ticket, Users, TrendingUp } from 'lucide-react';
import { eventsApi } from '@/lib/api/events.api';
import { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi
      .getStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Événements à venir',
      value: stats?.upcomingEvents ?? 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Réservations totales',
      value: stats?.totalReservations ?? 0,
      icon: Ticket,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Taux de remplissage',
      value: `${Math.round(stats?.fillRate ?? 0)}%`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Événements publiés',
      value: stats?.statusDistribution?.PUBLISHED ?? 0,
      icon: Users,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Tableau de bord administrateur
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      {stats?.statusDistribution && (
        <div className="card mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Distribution des statuts
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">
                {stats.statusDistribution.DRAFT}
              </p>
              <p className="text-sm text-gray-500">Brouillons</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {stats.statusDistribution.PUBLISHED}
              </p>
              <p className="text-sm text-gray-500">Publiés</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-700">
                {stats.statusDistribution.CANCELED}
              </p>
              <p className="text-sm text-gray-500">Annulés</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
