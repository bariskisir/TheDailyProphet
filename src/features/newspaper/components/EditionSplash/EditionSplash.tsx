import { Emblem, Flourish } from '@/shared/components/Ornaments';
import './EditionSplash.scss';

interface EditionSplashProps {
  mode: 'loading' | 'missing';
}

export function EditionSplash({ mode }: EditionSplashProps) {
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash__card">
        <Emblem className="splash__emblem" />
        <div className="splash__title-row">
          <Flourish className="splash__flourish" />
          <h1 className="splash__title">The Daily Prophet</h1>
          <Flourish className="splash__flourish" mirrored />
        </div>
        {mode === 'loading' ? (
          <>
            <p className="splash__message">Today&rsquo;s edition is being prepared&hellip;</p>
            <p className="splash__hint">
              Our morning owls are gathering the latest world dispatches.
            </p>
          </>
        ) : (
          <>
            <p className="splash__message">
              The morning owls were delayed on their flight from Diagon Alley.
            </p>
            <p className="splash__hint">
              Please check your connection and summon the edition again.
            </p>
            <button
              type="button"
              className="splash__retry"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
