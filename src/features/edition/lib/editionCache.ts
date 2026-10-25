import {
  toDateStamp,
  type Edition,
  type EditionManifestEntry,
} from '@/shared/types/edition.ts';

const CACHE_STORAGE_KEY = 'daily-prophet:client-edition-cache:v6';
const MAX_HISTORY_ENTRIES = 5;

export interface CachedEditionSlot {
  edition: Edition;
  createdAt: number;
  expiresAt: number;
}

interface StoredCachePayload {
  active: CachedEditionSlot | null;
  history: Record<string, Edition>;
}

export function getNextSevenAmTimestamp(now = new Date()): number {
  const todayAt7am = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    7,
    0,
    0,
    0,
  );
  if (now.getTime() < todayAt7am.getTime()) {
    return todayAt7am.getTime();
  }
  const tomorrowAt7am = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    7,
    0,
    0,
    0,
  );
  return tomorrowAt7am.getTime();
}

export function formatLocalIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
  } catch {
    return 'Europe/Istanbul';
  }
}

function readStorage(): StoredCachePayload {
  if (typeof window === 'undefined') {
    return { active: null, history: {} };
  }
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { active: null, history: {} };
    const parsed = JSON.parse(raw) as Partial<StoredCachePayload>;
    return {
      active: parsed.active ?? null,
      history: parsed.history && typeof parsed.history === 'object' ? parsed.history : {},
    };
  } catch {
    return { active: null, history: {} };
  }
}

function writeStorage(payload: StoredCachePayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
}

export function toManifestEntry(edition: Edition): EditionManifestEntry {
  const stamp = edition.stamp ?? toDateStamp(edition.date);
  return {
    date: edition.date,
    stamp,
    issue: edition.issue,
    printedAt: edition.printedAt,
    articleCount: edition.articles.length,
  };
}

export function readCachedEdition(requestedDateOrStamp?: string): {
  edition: Edition;
  availableEditions: EditionManifestEntry[];
  expiresAt: number;
} | null {
  const store = readStorage();
  const now = Date.now();

  const buildManifestList = (current: Edition): EditionManifestEntry[] => {
    const map = new Map<string, EditionManifestEntry>();
    const currentEntry = toManifestEntry(current);
    map.set(currentEntry.stamp, currentEntry);
    for (const ed of Object.values(store.history)) {
      if (ed && Array.isArray(ed.articles) && ed.articles.length > 0) {
        const entry = toManifestEntry(ed);
        map.set(entry.stamp, entry);
      }
    }
    return [...map.values()].sort((a, b) => b.stamp.localeCompare(a.stamp));
  };

  if (requestedDateOrStamp) {
    const stamp = toDateStamp(requestedDateOrStamp);
    if (
      store.active &&
      now < store.active.expiresAt &&
      store.active.edition.stamp === stamp
    ) {
      return {
        edition: store.active.edition,
        availableEditions: buildManifestList(store.active.edition),
        expiresAt: store.active.expiresAt,
      };
    }
    const historical = store.history[stamp];
    if (historical && Array.isArray(historical.articles) && historical.articles.length > 0) {
      return {
        edition: historical,
        availableEditions: buildManifestList(historical),
        expiresAt: store.active?.expiresAt ?? getNextSevenAmTimestamp(),
      };
    }
  }

  if (
    store.active &&
    now < store.active.expiresAt &&
    Array.isArray(store.active.edition.articles) &&
    store.active.edition.articles.length > 0
  ) {
    return {
      edition: store.active.edition,
      availableEditions: buildManifestList(store.active.edition),
      expiresAt: store.active.expiresAt,
    };
  }

  return null;
}

export function saveCachedEdition(edition: Edition): {
  edition: Edition;
  availableEditions: EditionManifestEntry[];
  expiresAt: number;
} {
  const now = new Date();
  const expiresAt = getNextSevenAmTimestamp(now);
  const store = readStorage();

  const stamp = edition.stamp ?? toDateStamp(edition.date);
  const nextHistory: Record<string, Edition> = {
    ...store.history,
    [stamp]: edition,
  };

  const sortedStamps = Object.keys(nextHistory).sort((a, b) => b.localeCompare(a));
  for (const oldStamp of sortedStamps.slice(MAX_HISTORY_ENTRIES)) {
    delete nextHistory[oldStamp];
  }

  const slot: CachedEditionSlot = {
    edition,
    createdAt: now.getTime(),
    expiresAt,
  };

  writeStorage({
    active: slot,
    history: nextHistory,
  });

  const entries = Object.values(nextHistory)
    .map(toManifestEntry)
    .sort((a, b) => b.stamp.localeCompare(a.stamp));

  return {
    edition,
    availableEditions: entries,
    expiresAt,
  };
}
