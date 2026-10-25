import type { Edition } from '@/shared/types/edition.ts';
import type { BackPageModel } from '@/features/edition';
import { Advert, Story } from '@/features/stories';
import { Divider, Emblem } from '@/shared/components/Ornaments';
import { cx } from '@/shared/lib/cx.ts';
import { formatLongDate, formatTime } from '@/shared/lib/format.ts';
import { RunningHead } from '../RunningHead/RunningHead.tsx';
import { SectionBanner } from '../SectionBanner/SectionBanner.tsx';
import { Sheet } from '../Sheet/Sheet.tsx';
import type { PageContext } from '../../types.ts';
import './BackPage.scss';

interface BackPageProps {
  edition: Edition;
  model: BackPageModel;
  context: PageContext;
}

export function BackPage({ edition, model, context }: BackPageProps) {
  const isMobile = model.target === 'mobile';
  const maxBriefs = isMobile ? 2 : 3;
  const maxDecrees = isMobile ? 2 : 3;

  return (
    <Sheet
      side={context.side}
      label={`Back page — Page ${context.pageNumber}`}
      className={cx('back-page', isMobile && 'back-page--mobile')}
    >
      <RunningHead date={edition.date} pageNumber={context.pageNumber} side={context.side} />
      <SectionBanner title="Late Owl Dispatches &amp; Notices" />

      {model.briefs.length > 0 && (
        <div className="back-page__briefs">
          {model.briefs.slice(0, maxBriefs).map((article) => (
            <div key={article.id} className="back-page__brief">
              <Story article={article} variant="brief" picture={isMobile ? 'none' : 'small'} columns={1} />
            </div>
          ))}
        </div>
      )}

      <Divider className="back-page__divider" />

      <div className="back-page__lower">
        {edition.decrees.length > 0 && (
          <section className="back-page__decrees" aria-label="Ministry of Magic public notices">
            <h3 className="back-page__decrees-title">By Order of the Ministry of Magic</h3>
            <div className="back-page__decrees-list">
              {edition.decrees.slice(0, maxDecrees).map((decree) => (
                <div key={decree.number} className="back-page__decree">
                  <span className="back-page__decree-num">Proclamation No. {decree.number}</span>
                  <h4 className="back-page__decree-head">{decree.title}</h4>
                  <p className="back-page__decree-body">{decree.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Advert adverts={edition.adverts} seed={edition.issue} className="back-page__advert" />
      </div>

      <footer className="back-page__colophon">
        <Emblem className="back-page__emblem" />
        <div className="back-page__colophon-body">
          <p className="back-page__colophon-head">
            <strong>The Daily Prophet</strong> &middot; {formatLongDate(edition.date)} &middot; Morning Edition
          </p>
          <p className="back-page__colophon-sources">
            Printed by enchanted press in Diagon Alley at {formatTime(edition.printedAt, edition.timeZone)} ({edition.timeZone}) from dispatches carried by{' '}
            {edition.sources.join(', ')}.
          </p>
        </div>
      </footer>
    </Sheet>
  );
}
