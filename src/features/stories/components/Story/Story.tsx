import type { Article } from '@/shared/types/edition.ts';
import { Fleuron } from '@/shared/components/Ornaments';
import { cx } from '@/shared/lib/cx.ts';
import { MovingPicture, type PictureSize } from '../MovingPicture/MovingPicture.tsx';
import { headlineScale } from './headlineScale.ts';
import './Story.scss';

export type StoryVariant = 'feature' | 'standard' | 'brief';

interface StoryProps {
  article: Article;
  variant?: StoryVariant;

  picture?: PictureSize | 'none';

  columns?: number;
  className?: string;
}

export function Story({ article, variant = 'standard', picture = 'medium', columns = 1, className }: StoryProps) {
  const paragraphs = article.paragraphs.length ? article.paragraphs : article.summary ? [article.summary] : [];
  const standfirst = article.paragraphs.length > 0 && article.summary ? article.summary : null;

  return (
    <article className={cx('story', `story--${variant}`, className)} style={{ ['--story-columns' as string]: columns }}>
      <h2 className={cx('story__headline', `story__headline--${headlineScale(article.title, variant)}`)}>{article.title}</h2>
      <p className="story__byline">
        From our correspondents at <span className="story__source">{article.source}</span>
      </p>
      {picture !== 'none' && article.media && <MovingPicture article={article} size={picture} className="story__picture" />}
      {standfirst && <p className="story__standfirst">{standfirst}</p>}
      <div className="story__body">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <footer className="story__footer">
        <a className="story__continued" href={article.url} target="_blank" rel="noopener noreferrer">
          Continued at {article.source} &rarr;
        </a>
        {variant !== 'brief' && <Fleuron className="story__fleuron" />}
      </footer>
    </article>
  );
}
