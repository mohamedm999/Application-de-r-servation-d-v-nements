'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { EventStatus } from '@/types';

interface EventFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange?: (status: string) => void;
  search?: string;
  status?: string;
  showStatusFilter?: boolean;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: EventStatus.PUBLISHED, label: 'Publié' },
  { value: EventStatus.DRAFT, label: 'Brouillon' },
  { value: EventStatus.CANCELED, label: 'Annulé' },
];

export default function EventFilters({
  onSearchChange,
  onStatusChange,
  search = '',
  status = '',
  showStatusFilter = false,
}: EventFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un événement..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="input-field pl-10 pr-10"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showStatusFilter && onStatusChange && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input-field w-auto"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
