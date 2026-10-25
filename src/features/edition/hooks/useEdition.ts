import { useCallback, useEffect, useState } from 'react';
import { toDateStamp, type Edition, type EditionManifestEntry } from '@/shared/types/edition.ts';
import { fetchEdition } from '../api/fetchEdition.ts';

export type EditionState =
  | { status: 'loading' }
  | {
      status: 'ready';
      edition: Edition;
      availableEditions: EditionManifestEntry[];
      selectDate: (dateOrStamp: string) => void;
    }
  | { status: 'missing'; reason: string };

function initialDateFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const param = new URLSearchParams(window.location.search).get('date');
  return param ? toDateStamp(param) : undefined;
}

export function useEdition(): EditionState {
  const [requestedStamp, setRequestedStamp] = useState<string | undefined>(() => initialDateFromUrl());
  const [refreshTick, setRefreshTick] = useState(0);
  const [bundle, setBundle] = useState<{
    status: 'loading' | 'ready' | 'missing';
    edition?: Edition;
    availableEditions?: EditionManifestEntry[];
    expiresAt?: number;
    reason?: string;
  }>({ status: 'loading' });

  const selectDate = useCallback((dateOrStamp: string) => {
    const stamp = toDateStamp(dateOrStamp);
    if (stamp.length !== 8) return;
    setRequestedStamp(stamp);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('date', stamp);
      window.history.replaceState({}, '', url);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setBundle((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }));

    fetchEdition(requestedStamp, controller.signal)
      .then(({ edition, availableEditions, expiresAt }) => {
        setBundle({ status: 'ready', edition, availableEditions, expiresAt });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setBundle({
          status: 'missing',
          reason: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [requestedStamp, refreshTick]);

  useEffect(() => {
    if (bundle.status !== 'ready' || !bundle.expiresAt) return;
    const msUntilSevenAm = Math.max(1000, bundle.expiresAt - Date.now() + 250);
    const delay = Math.min(msUntilSevenAm, 86_400_000);
    const timer = window.setTimeout(() => {
      if (Date.now() >= (bundle.expiresAt ?? 0)) {
        setRequestedStamp(undefined);
        setRefreshTick((t) => t + 1);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [bundle.expiresAt, bundle.status]);

  if (bundle.status === 'loading') return { status: 'loading' };
  if (bundle.status === 'missing' || !bundle.edition) {
    return { status: 'missing', reason: bundle.reason ?? 'Edition unavailable.' };
  }

  return {
    status: 'ready',
    edition: bundle.edition,
    availableEditions: bundle.availableEditions ?? [],
    selectDate,
  };
}
