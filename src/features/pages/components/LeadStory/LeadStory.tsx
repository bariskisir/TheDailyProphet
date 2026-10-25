import type { Article } from '@/shared/types/edition.ts';
import { cx } from '@/shared/lib/cx.ts';
import { MovingPicture, headlineScale } from '@/features/stories';
import './LeadStory.scss';

interface LeadStoryProps {
  lead: Article;

  figure: Article | null;

  mobile?: boolean;
}

export function LeadStory({ lead, figure, mobile = false }: LeadStoryProps) {
  const paragraphs = lead.paragraphs.length ? lead.paragraphs : [lead.summary].filter(Boolean);
  const half = Math.ceil(paragraphs.length / 2);
  const showStandfirst = lead.paragraphs.length > 0 && Boolean(lead.summary);

  if (mobile) {
    return (
      <section
        className={cx('lead', 'lead--mobile', !figure && 'lead--text-only')}
        aria-label="Lead story"
      >
        <h2 className={cx('lead__headline', `lead__headline--${headlineScale(lead.title, 'lead')}`)}>
          {lead.title}
        </h2>
        {showStandfirst && <p className="lead__standfirst">{lead.summary}</p>}

        <div className="lead__body">
          {figure && (
            <div className="lead__figure">
              <MovingPicture article={figure} size="medium" />
              {figure !== lead && (
                <a className="lead__figure-story" href={figure.url} target="_blank" rel="noopener noreferrer">
                  <span className="lead__figure-kicker">Pictured</span> {figure.title}
                </a>
              )}
            </div>
          )}

          <div className="lead__column lead__column--first">
            <p className="lead__byline">
              From our correspondents at <strong>{lead.source}</strong>
            </p>
            <div className="lead__text">
              {paragraphs.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </div>
        </div>

        <a className="lead__continued" href={lead.url} target="_blank" rel="noopener noreferrer">
          Continued at {lead.source} &rarr;
        </a>
      </section>
    );
  }

  return (
    <section className={cx('lead', !figure && 'lead--text-only')} aria-label="Lead story">
      <h2 className={cx('lead__headline', `lead__headline--${headlineScale(lead.title, 'lead')}`)}>{lead.title}</h2>
      {showStandfirst && <p className="lead__standfirst">{lead.summary}</p>}

      <div className="lead__body">
        <div className="lead__column lead__column--first">
          <p className="lead__byline">
            From our correspondents at <strong>{lead.source}</strong>
          </p>
          <div className="lead__text">
            {(figure ? paragraphs.slice(0, half) : paragraphs).map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        </div>

        {figure && (
          <div className="lead__figure">
            <MovingPicture article={figure} size="hero" />
            {figure !== lead && (
              <a className="lead__figure-story" href={figure.url} target="_blank" rel="noopener noreferrer">
                <span className="lead__figure-kicker">Pictured</span> {figure.title}
              </a>
            )}
          </div>
        )}

        {figure && (
          <div className="lead__column lead__column--last">
            <div className="lead__text">
              {paragraphs.slice(half).map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <a className="lead__continued" href={lead.url} target="_blank" rel="noopener noreferrer">
        Continued at {lead.source} &rarr;
      </a>
    </section>
  );
}
