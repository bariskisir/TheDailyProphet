import { useEffect, useState } from 'react';
import type { EditionManifestEntry } from '@/shared/types/edition.ts';
import { formatShortDate } from '@/shared/lib/format.ts';
import type { ReadingMode } from '../../hooks/useViewportLayout.ts';
import './NewspaperToolbar.scss';

interface NewspaperToolbarProps {
  editionDate: string;
  currentStamp: string;
  availableEditions: EditionManifestEntry[];
  currentPage: number;
  totalPages: number;
  mode: ReadingMode;
  muted: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (pageIndex: number) => void;
  onSelectEdition: (stamp: string) => void;
  onToggleMute: () => void;
}

export function NewspaperToolbar({
  editionDate,
  currentStamp,
  availableEditions,
  currentPage,
  totalPages,
  mode,
  muted,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onSelectPage,
  onSelectEdition,
  onToggleMute,
}: NewspaperToolbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    } else {
      void document.exitFullscreen?.().catch(() => undefined);
    }
  };

  const isDualSpread =
    mode === 'spread' && currentPage > 0 && currentPage + 1 < totalPages;

  const pageLabel = isDualSpread
    ? `Pages ${currentPage + 1}–${currentPage + 2} of ${totalPages}`
    : `Page ${currentPage + 1} of ${totalPages}`;

  return (
    <nav className="toolbar" aria-label="Newspaper controls">
      <div className="toolbar__group toolbar__group--meta">
        {availableEditions.length > 1 ? (
          <select
            className="toolbar__select"
            aria-label="Select edition date"
            value={currentStamp}
            onChange={(event) => onSelectEdition(event.target.value)}
          >
            {availableEditions.map((entry) => (
              <option key={entry.stamp} value={entry.stamp}>
                {formatShortDate(entry.date)}
              </option>
            ))}
          </select>
        ) : (
          <span className="toolbar__badge">
            {formatShortDate(editionDate)}
          </span>
        )}
      </div>

      <div className="toolbar__group toolbar__group--nav">
        <button
          type="button"
          className="toolbar__btn"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous page"
          title="Previous page (Left arrow)"
        >
          <span aria-hidden="true">&larr;</span>
          <span className="toolbar__btn-text">Prev</span>
        </button>

        <div className="toolbar__pages" role="tablist" aria-label="Jump to page">
          {Array.from({ length: totalPages }, (_, index) => {
            const active = isDualSpread
              ? index === currentPage || index === currentPage + 1
              : index === currentPage;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active}
                className={`toolbar__page-dot${active ? ' is-active' : ''}`}
                onClick={() => onSelectPage(index)}
                title={`Go to page ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <span className="toolbar__status">{pageLabel}</span>

        <button
          type="button"
          className="toolbar__btn"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next page"
          title="Next page (Right arrow)"
        >
          <span className="toolbar__btn-text">Next</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div className="toolbar__group toolbar__group--tools">
        <button
          type="button"
          className={`toolbar__icon-btn${muted ? ' is-muted' : ''}`}
          onClick={onToggleMute}
          aria-pressed={!muted}
          title={muted ? 'Unmute paper rustle sound effects' : 'Mute paper rustle sound effects'}
        >
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          <span className="toolbar__btn-text">{muted ? 'Muted' : 'Sound'}</span>
        </button>

        <button
          type="button"
          className="toolbar__icon-btn"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Read in full screen'}
        >
          <span aria-hidden="true">{isFullscreen ? '⤫' : '⛶'}</span>
          <span className="toolbar__btn-text">{isFullscreen ? 'Exit' : 'Full'}</span>
        </button>
      </div>
    </nav>
  );
}
