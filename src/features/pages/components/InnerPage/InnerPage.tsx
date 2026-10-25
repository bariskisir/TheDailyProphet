import type { Edition } from '@/shared/types/edition.ts';
import type { InnerPageModel } from '@/features/edition';
import { Advert, Story } from '@/features/stories';
import { Divider } from '@/shared/components/Ornaments';
import { cx } from '@/shared/lib/cx.ts';
import { RunningHead } from '../RunningHead/RunningHead.tsx';
import { SectionBanner } from '../SectionBanner/SectionBanner.tsx';
import { Sheet } from '../Sheet/Sheet.tsx';
import type { PageContext } from '../../types.ts';
import './InnerPage.scss';

interface InnerPageProps {
  edition: Edition;
  model: InnerPageModel;
  context: PageContext;
}

export function InnerPage({ edition, model, context }: InnerPageProps) {
  const [first, second, third, fourth] = model.articles;
  const isMobile = model.target === 'mobile';

  return (
    <Sheet
      side={context.side}
      label={`${model.section} — Page ${context.pageNumber}`}
      className={cx('inner-page', `inner-page--${model.layout}`, isMobile && 'inner-page--mobile')}
    >
      <RunningHead date={edition.date} pageNumber={context.pageNumber} side={context.side} />
      <SectionBanner title={model.section} />

      {model.layout === 'feature' && (
        <div className="inner-page__grid inner-page__grid--feature">
          <div className="inner-page__main">
            {first && <Story article={first} variant="feature" picture="large" columns={2} />}
          </div>
          <div className="inner-page__rail">
            {second && <Story article={second} variant="standard" picture="small" columns={1} />}
            <Divider className="inner-page__rule" />
            {third ? (
              <Story article={third} variant="brief" picture="none" columns={1} />
            ) : (
              <Advert adverts={edition.adverts} seed={model.advert} />
            )}
          </div>
        </div>
      )}

      {model.layout === 'trio' && (
        <div className="inner-page__grid inner-page__grid--trio">
          <div className="inner-page__top-row">
            {first && (
              <div className="inner-page__col inner-page__col--wide">
                <Story article={first} variant="feature" picture="medium" columns={2} />
              </div>
            )}
            {second && (
              <div className="inner-page__col">
                <Story article={second} variant="standard" picture="small" columns={1} />
              </div>
            )}
          </div>
          <Divider className="inner-page__rule" />
          <div className="inner-page__bottom-row">
            {third && (
              <div className="inner-page__col inner-page__col--wide">
                <Story article={third} variant="standard" picture="none" columns={2} />
              </div>
            )}
            <Advert adverts={edition.adverts} seed={model.advert} className="inner-page__advert" />
          </div>
        </div>
      )}

      {model.layout === 'mosaic' && (
        <div className="inner-page__grid inner-page__grid--mosaic">
          <div className="inner-page__mosaic-left">
            {first && <Story article={first} variant="feature" picture="medium" columns={2} />}
            <Divider className="inner-page__rule" />
            {second && <Story article={second} variant="brief" picture="none" columns={2} />}
          </div>
          <div className="inner-page__mosaic-right">
            {third && <Story article={third} variant="standard" picture="small" columns={1} />}
            {fourth ? (
              <Story article={fourth} variant="brief" picture="none" columns={1} />
            ) : (
              <Advert adverts={edition.adverts} seed={model.advert} />
            )}
          </div>
        </div>
      )}

      {model.layout === 'mobile-solo' && (
        <div className="inner-page__grid inner-page__grid--mobile-solo">
          <div className="inner-page__mobile-top">
            {first && (
              <Story
                article={first}
                variant="feature"
                picture={second || model.advert % 2 === 1 ? 'medium' : 'large'}
                columns={2}
              />
            )}
          </div>
          {(second || model.advert % 2 === 1) && (
            <>
              <Divider className="inner-page__rule" />
              <div className="inner-page__mobile-bottom">
                {second ? (
                  <Story article={second} variant="brief" picture="none" columns={2} />
                ) : (
                  <Advert adverts={edition.adverts} seed={model.advert} />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {model.layout === 'mobile-duo' && (
        <div className="inner-page__grid inner-page__grid--mobile-duo">
          <div className="inner-page__mobile-top">
            {first && <Story article={first} variant="standard" picture="medium" columns={2} />}
          </div>
          <Divider className="inner-page__rule" />
          <div className="inner-page__mobile-bottom">
            {second ? (
              <Story article={second} variant="brief" picture="none" columns={2} />
            ) : (
              <Advert adverts={edition.adverts} seed={model.advert} />
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}
