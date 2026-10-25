import type { EditionAdvert } from '@/shared/types/edition.ts';
import { Corner } from '@/shared/components/Ornaments';
import './Advert.scss';

interface AdvertProps {
  adverts: EditionAdvert[];
  seed: number;
  className?: string;
}

export function Advert({ adverts, seed, className }: AdvertProps) {
  if (!adverts.length) return null;
  const advert = adverts[((seed % adverts.length) + adverts.length) % adverts.length];

  return (
    <aside className={`advert ${className ?? ''}`} aria-label={`Advertisement: ${advert.title}`}>
      <Corner className="advert__corner advert__corner--tl" />
      <Corner className="advert__corner advert__corner--tr" />
      <Corner className="advert__corner advert__corner--bl" />
      <Corner className="advert__corner advert__corner--br" />
      <span className="advert__label">Advertisement</span>
      <h3 className="advert__title">{advert.title}</h3>
      <p className="advert__tagline">{advert.tagline}</p>
      <p className="advert__body">{advert.body}</p>
      <p className="advert__address">{advert.address}</p>
    </aside>
  );
}
