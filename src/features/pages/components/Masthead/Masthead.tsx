import type { Edition } from '@/shared/types/edition.ts';
import { Emblem, Flourish } from '@/shared/components/Ornaments';
import { formatLongDate, formatShortDate, formatTime } from '@/shared/lib/format.ts';
import './Masthead.scss';

export function Masthead({ edition }: { edition: Edition }) {
  return (
    <header className="masthead">
      <div className="masthead__top">
        <div className="masthead__ear">
          <span className="masthead__ear-label">Price</span>
          <strong className="masthead__ear-value">Seven Knuts</strong>
        </div>
        <div className="masthead__crest">
          <Emblem className="masthead__emblem" />
          <p className="masthead__tagline">The Wizarding World&rsquo;s Beguiling Broadsheet of Choice</p>
        </div>
        <div className="masthead__ear">
          <span className="masthead__ear-label">Edition Date</span>
          <strong className="masthead__ear-value">{formatShortDate(edition.date)}</strong>
        </div>
      </div>

      <div className="masthead__title-row">
        <Flourish className="masthead__flourish" />
        <h1 className="masthead__title">
          <span className="masthead__the">The</span>
          <span className="masthead__name">Daily Prophet</span>
        </h1>
        <Flourish className="masthead__flourish" mirrored />
      </div>

      <div className="masthead__dateline">
        <span>Morning Edition</span>
        <span className="masthead__date">{formatLongDate(edition.date)}</span>
        <span>Delivered by owl at {formatTime(edition.printedAt, edition.timeZone)}</span>
      </div>
    </header>
  );
}
