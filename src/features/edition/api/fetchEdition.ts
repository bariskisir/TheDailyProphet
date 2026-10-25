import type { Edition, EditionManifestEntry } from '@/shared/types/edition.ts';
import { generateClientEdition } from '../lib/clientPress.ts';
import {
  getNextSevenAmTimestamp,
  readCachedEdition,
  saveCachedEdition,
  toManifestEntry,
} from '../lib/editionCache.ts';

export class EditionNotPrintedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'EditionNotPrintedError';
  }
}

export interface LoadedEditionBundle {
  edition: Edition;
  availableEditions: EditionManifestEntry[];
  expiresAt: number;
}

export async function fetchEdition(
  requestedDateOrStamp?: string,
  signal?: AbortSignal,
): Promise<LoadedEditionBundle> {
  const cached = readCachedEdition(requestedDateOrStamp);
  if (cached) {
    return cached;
  }

  const generated = await generateClientEdition(requestedDateOrStamp, signal);
  if (generated.articles.length === 0) {
    throw new EditionNotPrintedError('Unable to reach world news dispatches.');
  }

  const saved = saveCachedEdition(generated);
  return {
    edition: saved.edition,
    availableEditions: saved.availableEditions.length
      ? saved.availableEditions
      : [toManifestEntry(saved.edition)],
    expiresAt: saved.expiresAt ?? getNextSevenAmTimestamp(),
  };
}
