import type { Edition } from '@/shared/types/edition.ts';
import type { FrontPageModel } from '@/features/edition';
import { Story } from '@/features/stories';
import { Divider } from '@/shared/components/Ornaments';
import { cx } from '@/shared/lib/cx.ts';
import { LeadStory } from '../LeadStory/LeadStory.tsx';
import { Masthead } from '../Masthead/Masthead.tsx';
import { Sheet } from '../Sheet/Sheet.tsx';
import type { ContentsEntry, PageContext } from '../../types.ts';
import './FrontPage.scss';

interface FrontPageProps {
  edition: Edition;
  model: FrontPageModel;
  contents: ContentsEntry[];
  context: PageContext;
  onSelectPage?: (pageNumber: number) => void;
}

export function FrontPage({ edition, model, contents, context, onSelectPage }: FrontPageProps) {
  const figure = model.lead.media ? model.lead : model.picture;
  const isMobile = model.target === 'mobile';
  const maxContents = isMobile ? 4 : 5;

  return (
    <Sheet
      side={context.side}
      label="Front page — Page 1"
      className={cx('front-page', isMobile && 'front-page--mobile')}
    >
      <Masthead edition={edition} />
      <LeadStory lead={model.lead} figure={figure} mobile={isMobile} />
      <Divider className="front-page__divider" />

      <div className="front-page__bottom">
        {!isMobile &&
          model.briefs.map((article) => (
            <div key={article.id} className="front-page__brief">
              <Story article={article} variant="brief" picture="none" columns={1} />
            </div>
          ))}

        <aside className="front-page__contents" aria-label="Inside today's edition">
          <h3 className="front-page__contents-title">Inside Today&rsquo;s Prophet</h3>
          <ul className="front-page__contents-list">
            {contents.slice(0, maxContents).map((item, idx) => (
              <li key={idx} className="front-page__contents-item">
                <button
                  type="button"
                  className="front-page__contents-link"
                  onClick={() => onSelectPage?.(item.pageNumber)}
                >
                  <span className="front-page__contents-headline">{item.title}</span>
                  <span className="front-page__contents-dots" aria-hidden="true" />
                  <span className="front-page__contents-page">p.&nbsp;{item.pageNumber}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Sheet>
  );
}
