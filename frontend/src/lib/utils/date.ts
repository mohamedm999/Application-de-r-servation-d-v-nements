import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
}

export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: fr });
}

export function isEventPast(dateString: string): boolean {
  return isPast(parseISO(dateString));
}
