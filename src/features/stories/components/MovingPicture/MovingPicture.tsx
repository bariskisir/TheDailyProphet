import { useState, type CSSProperties, type SyntheticEvent } from 'react';
import type { Article } from '@/shared/types/edition.ts';
import { cx } from '@/shared/lib/cx.ts';
import './MovingPicture.scss';

export type PictureSize = 'hero' | 'large' | 'medium' | 'small';

interface MovingPictureProps {
  article: Article;
  size?: PictureSize;
  className?: string;
}

const LOOP_START_SEC = 4;
const LOOP_END_SEC = 12;

function motionVariantFromId(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum = (sum + id.charCodeAt(i) * (i + 1)) % 4;
  }
  return sum;
}

export function MovingPicture({ article, size = 'medium', className }: MovingPictureProps) {
  const [loaded, setLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const { media } = article;
  if (!media) return null;

  const moving = media.kind === 'gif' || size === 'hero' || size === 'large';
  const variant = motionVariantFromId(article.id);
  const aspectRatio = media.width > 0 && media.height > 0 ? media.width / media.height : 16 / 9;
  const resolvedSrc = media.src;
  const resolvedPoster = media.poster;
  const isVideo = !videoFailed && /\.(mp4|webm)(\?|$)/i.test(resolvedSrc);
  const imageSrc = isVideo ? resolvedPoster : resolvedPoster ?? resolvedSrc;

  if (!isVideo && !imageSrc) return null;

  const handleVideoMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (Number.isFinite(video.duration) && video.duration > LOOP_START_SEC + 2) {
      video.currentTime = LOOP_START_SEC;
    }
  };

  const handleVideoTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (video.currentTime >= LOOP_END_SEC) {
      video.currentTime =
        Number.isFinite(video.duration) && video.duration > LOOP_START_SEC + 2
          ? LOOP_START_SEC
          : 0;
      void video.play().catch(() => undefined);
    }
  };

  const figureStyle: CSSProperties = {
    ['--pic-ar' as string]: aspectRatio.toFixed(4),
    ['--pic-delay' as string]: `${-((article.id.charCodeAt(0) || 0) % 7) * 0.85}s`,
  };

  return (
    <figure
      className={cx(
        'picture',
        `picture--${size}`,
        `picture--motion-${variant}`,
        moving ? 'picture--moving' : 'picture--living',
        loaded && 'is-loaded',
        className,
      )}
      style={figureStyle}
    >
      <div className="picture__frame">
        <div
          className="picture__plate"
          style={{ aspectRatio: `${media.width} / ${media.height}` }}
        >
          {isVideo ? (
            <video
              className="picture__image"
              src={resolvedSrc}
              poster={resolvedPoster}
              width={media.width}
              height={media.height}
              preload="metadata"
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={handleVideoMetadata}
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedData={() => setLoaded(true)}
              onError={() => {
                setVideoFailed(true);
                if (!resolvedPoster) setLoaded(false);
              }}
            />
          ) : (
            imageSrc && (
              <>
                <img
                  className="picture__image"
                  src={imageSrc}
                  width={media.width}
                  height={media.height}
                  alt=""
                  decoding="async"
                  draggable={false}
                  onLoad={() => setLoaded(true)}
                />
                {moving && (
                  <img
                    className="picture__ghost"
                    src={imageSrc}
                    width={media.width}
                    height={media.height}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    draggable={false}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
      <figcaption className="picture__caption">
        {isVideo || moving ? 'Moving picture' : 'Enchanted photograph'} &middot; {article.source}
      </figcaption>
    </figure>
  );
}
