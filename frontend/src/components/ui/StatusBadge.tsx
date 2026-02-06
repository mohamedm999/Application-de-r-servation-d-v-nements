import { cn } from '@/lib/utils/cn';

type StatusType = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  PUBLISHED: { label: 'Publié', className: 'bg-green-100 text-green-700' },
  CANCELED: { label: 'Annulé', className: 'bg-red-100 text-red-700' },
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmé', className: 'bg-green-100 text-green-700' },
  REFUSED: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
