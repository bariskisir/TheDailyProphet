import { formatShortDate } from '@/shared/lib/format.ts';
import './RunningHead.scss';

interface RunningHeadProps {
  date: string;
  pageNumber: number;

  side: 'left' | 'right' | 'single';
}

export function RunningHead({ date, pageNumber, side }: RunningHeadProps) {
  const number = <span className="running-head__page">Page {pageNumber}</span>;
  return (
    <header className="running-head">
      {side === 'left' ? number : <span className="running-head__date">{formatShortDate(date)}</span>}
      <span className="running-head__title">The Daily Prophet</span>
      {side === 'left' ? <span className="running-head__date">{formatShortDate(date)}</span> : number}
    </header>
  );
}
