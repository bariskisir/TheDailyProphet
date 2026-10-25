export type HeadlineScale = 'xl' | 'l' | 'm' | 's';

export function headlineScale(title: string, variant: 'lead' | 'feature' | 'standard' | 'brief'): HeadlineScale {
  const length = title.length;
  switch (variant) {
    case 'lead':
      return length > 95 ? 'm' : length > 65 ? 'l' : 'xl';
    case 'feature':
      return length > 85 ? 'm' : 'l';
    case 'standard':
      return length > 80 ? 's' : 'm';
    default:
      return 's';
  }
}
