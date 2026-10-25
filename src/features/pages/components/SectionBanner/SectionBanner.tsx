import { Flourish } from '@/shared/components/Ornaments';
import './SectionBanner.scss';

export function SectionBanner({ title }: { title: string }) {
  return (
    <div className="section-banner">
      <Flourish className="section-banner__flourish" />
      <h2 className="section-banner__title">{title}</h2>
      <Flourish className="section-banner__flourish" mirrored />
    </div>
  );
}
