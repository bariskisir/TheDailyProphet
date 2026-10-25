export function toOrdinal(day: number): string {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  const suffix = ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th';
  return `${day}${suffix}`;
}

const noon = (isoDate: string): Date => new Date(`${isoDate}T12:00:00Z`);

export function formatLongDate(isoDate: string): string {
  const date = noon(isoDate);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  const month = date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
  return `${weekday}, the ${toOrdinal(date.getUTCDate())} of ${month}, ${date.getUTCFullYear()}`;
}

export const formatShortDate = (isoDate: string): string =>
  noon(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatTime = (iso: string, timeZone: string): string =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
