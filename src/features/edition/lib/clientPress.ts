import {
  toDateStamp,
  type Article,
  type Edition,
  type EditionAdvert,
  type EditionDecree,
} from '@/shared/types/edition.ts';
import { formatLocalIsoDate, getUserTimeZone } from './editionCache.ts';

const FIRST_ISSUE_DATE = '1997-06-26';
const TARGET_ARTICLE_COUNT = 34;

const ADVERTS_POOL: EditionAdvert[] = [
  {
    title: 'Weasleys\u2019 Wizard Wheezes',
    tagline: 'Why Worry When You Can Wheeze?',
    body: 'Skiving Snackboxes, Patented Daydream Charms, Decoy Detonators & Peruvian Instant Darkness Powder. Mail-order by owl available.',
    address: 'No. 93 Diagon Alley, London',
  },
  {
    title: 'Ollivanders',
    tagline: 'Makers of Fine Wands Since 382 B.C.',
    body: 'Every Ollivander wand has a core of a powerful magical substance: phoenix feather, unicorn hair, or dragon heartstring. The wand chooses the wizard.',
    address: 'Diagon Alley, South Side',
  },
  {
    title: 'Madam Malkin\u2019s',
    tagline: 'Robes for All Occasions',
    body: 'Hogwarts school lists outfitted while you wait. Self-ironing, self-mending dress robes in every colour of the spectrum.',
    address: 'Next to Flourish & Blotts, Diagon Alley',
  },
  {
    title: 'Flourish & Blotts',
    tagline: 'Booksellers to the Wizarding World',
    body: 'Now stocking The Standard Book of Spells, A History of Magic, and Monster Book of Monsters (handled at buyer\u2019s own peril).',
    address: 'North Side, Diagon Alley',
  },
  {
    title: 'Gringotts Wizarding Bank',
    tagline: 'Fortius Quo Fidelius',
    body: 'High-security underground vaults guarded by goblins and enchanted wards. Galleon, Sickle, and Knut exchange at the main marble hall.',
    address: 'Corner of Diagon & Knockturn Alley',
  },
  {
    title: 'Quality Quidditch Supplies',
    tagline: 'Purveyors of Racing Brooms & League Equipment',
    body: 'Inspect the latest Nimbus and Firebolt racing brooms, polish kits, and Chudley Cannons collector pennants.',
    address: 'No. 52 Diagon Alley',
  },
  {
    title: 'The Leaky Cauldron',
    tagline: 'Proprietor: Hannah Abbott \u00B7 Est. 1500',
    body: 'Hot Butterbeer, pea soup, and warm rooms overlooking Charing Cross Road and the brick archway to Diagon Alley.',
    address: '1 Charing Cross Road, London',
  },
  {
    title: 'Honeydukes Sweetshop',
    tagline: 'Confectioners of Distinction',
    body: 'Bertie Bott\u2019s Every Flavour Beans, Chocolate Frogs with collectible Famous Witches & Wizards cards, and Fizzing Whizzbees.',
    address: 'High Street, Hogsmeade Village',
  },
];

const DECREES_POOL: EditionDecree[] = [
  {
    number: 'XXIV',
    title: 'On the Enchantment of Muggle Artefacts',
    body: 'The Misuse of Muggle Artefacts Office reminds all witches and wizards that bewitching motor-cars, tea-sets, or wireless sets remains strictly forbidden.',
  },
  {
    number: 'CXVIII',
    title: 'International Statute of Secrecy',
    body: 'Owing to unusual activity on the Muggle news wires, the Department of Magical Accidents and Catastrophes urges particular discretion during daylight hours.',
  },
  {
    number: 'XLII',
    title: 'Owl Post & Foreign Dispatches',
    body: 'All long-distance owls arriving from overseas bureaux must be rested and given fresh water before being sent onward with the evening edition.',
  },
  {
    number: 'LXXXIX',
    title: 'Floo Network Chimney Inspection',
    body: 'Households connecting domestic hearths to the Floo Network must renew their Ministry registration prior to the winter solstice.',
  },
  {
    number: 'LXIV',
    title: 'Department of Magical Transportation',
    body: 'Unauthorized Portkeys created without written seal from the Portkey Office shall be confiscated immediately.',
  },
];

const TOPIC_ALIASES: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['france', ['france', 'french', 'paris', 'macron', 'frankreich']],
  ['italy', ['italy', 'italian', 'milan', 'rome', 'italien', 'rom']],
  ['serbia', ['serbia', 'serbian', 'belgrade', 'vucic', 'serbien', 'belgrad']],
  ['israel', ['israel', 'israeli', 'west bank', 'gaza', 'jerusalem', 'westjordanland', 'nahost']],
  ['ukraine', ['ukraine', 'ukrainian', 'kyiv', 'russia', 'russian', 'moscow', 'poland', 'russland', 'polen', 'krieg']],
  ['china', ['china', 'chinese', 'beijing', 'kim jong', 'korea', 'peking', 'asien']],
  ['usa', ['united states', 'u.s.', 'trump', 'obama', 'washington', 'white house', 'midterms', 'georgia']],
  ['iran', ['iran', 'tehran', 'middle east', 'jordan', 'teheran']],
  ['protest', ['protest', 'protesters', 'clashes', 'demonstration', 'march', 'ausschreitungen', 'proteste']],
];

function selectDailyAdverts(issue: number, count = 6): EditionAdvert[] {
  const start = Math.abs(issue) % ADVERTS_POOL.length;
  return Array.from({ length: count }, (_, i) => ADVERTS_POOL[(start + i) % ADVERTS_POOL.length]);
}

function selectDailyDecrees(issue: number, count = 3): EditionDecree[] {
  const start = Math.abs(issue) % DECREES_POOL.length;
  return Array.from({ length: count }, (_, i) => DECREES_POOL[(start + i) % DECREES_POOL.length]);
}

function computeIssueNumber(dateIso: string): number {
  const first = Date.parse(`${FIRST_ISSUE_DATE}T00:00:00Z`);
  const current = Date.parse(`${dateIso}T00:00:00Z`);
  if (!Number.isFinite(current)) return 10713;
  return Math.max(1, Math.floor((current - first) / 86_400_000) + 1);
}

function hashId(text: string): string {
  let h1 = 0xdeadbeef ^ text.length;
  let h2 = 0x41c6ce57 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0').slice(0, 4);
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#039;|&apos;|&#x27;/gi, "'")
    .replace(/&rsquo;/gi, '\u2019')
    .replace(/&lsquo;/gi, '\u2018')
    .replace(/&ldquo;/gi, '\u201C')
    .replace(/&rdquo;/gi, '\u201D')
    .replace(/&ndash;/gi, '\u2013')
    .replace(/&mdash;/gi, '\u2014')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSourceName(raw: string | undefined): string {
  const clean = (raw ?? '').trim();
  if (!clean) return 'International Wire';
  if (clean === 'BBC') return 'BBC News';
  if (clean === 'WSJ') return 'The Wall Street Journal';
  if (clean.toLowerCase() === 'euronews.com') return 'Euronews';
  if (clean.toLowerCase() === 'politico.eu') return 'POLITICO Europe';
  return clean;
}

function buildBroadsheetParagraphs(title: string, summary: string, source: string): string[] {
  const cleanHeadline = stripHtml(title).replace(/\.$/, '');
  const cleanSummary = stripHtml(summary || title);

  const p1 =
    cleanSummary !== cleanHeadline && cleanSummary.length > 55
      ? cleanSummary
      : `${cleanHeadline}. Senior correspondents at ${source} dispatched initial accounts of the developments as regional observers and diplomatic missions gathered to verify the full scope of the report.`;

  const p2 = `According to dispatches filed with ${source}, officials and independent analysts are closely monitoring the situation following today\u2019s developments regarding "${cleanHeadline}". Representatives across international capitals noted that further briefings and ministerial consultations are scheduled over the coming twenty-four hours.`;

  const p3 = `In statements circulated to foreign bureaux, observers emphasized the broader implications for cross-border policy, regional stability, and public administration. Our ${source} desk continues to receive late owl post updates as additional documentation is placed on the public record.`;

  return [p1, p2, p3];
}

function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [topic, keywords] of TOPIC_ALIASES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(topic);
    }
  }
  return matched;
}

interface OkSurfNewsItem {
  title?: string;
  link?: string;
  og?: string;
  source?: string;
}

interface OkSurfFeedResponse {
  World?: OkSurfNewsItem[];
  Business?: OkSurfNewsItem[];
}

interface TagesschauVideoItem {
  title?: string;
  tags?: Array<{ tag?: string }>;
  streams?: {
    h264s?: string;
    h264m?: string;
  };
}

interface TagesschauResponse {
  news?: TagesschauVideoItem[];
}

interface VideoClipCandidate {
  url: string;
  topics: string[];
}

async function fetchLiveVideoClips(signal?: AbortSignal): Promise<VideoClipCandidate[]> {
  try {
    const response = await fetch('https://www.tagesschau.de/api2u/news/', {
      signal,
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data = (await response.json()) as TagesschauResponse;
    const seenUrls = new Set<string>();
    const clips: VideoClipCandidate[] = [];

    for (const item of data.news ?? []) {
      const mp4 = item.streams?.h264s ?? item.streams?.h264m;
      if (!mp4 || !/^https:\/\/[^\s]+\.mp4$/i.test(mp4) || seenUrls.has(mp4)) continue;
      const titleText = item.title ?? '';
      if (/100 sekunden|wolkenfilm|wetteraussichten/i.test(titleText)) continue;
      seenUrls.add(mp4);
      const tagText = (item.tags ?? []).map((t) => t.tag ?? '').join(' ');
      clips.push({
        url: mp4,
        topics: extractTopics(`${titleText} ${tagText}`),
      });
    }
    return clips;
  } catch {
    return [];
  }
}

async function fetchDirectBrowserWorldNews(signal?: AbortSignal): Promise<Article[]> {
  const [feedResult, clipsResult] = await Promise.allSettled([
    fetch('https://ok.surf/api/v1/cors/news-feed', { signal, cache: 'no-store' }),
    fetchLiveVideoClips(signal),
  ]);

  if (feedResult.status !== 'fulfilled' || !feedResult.value.ok) return [];

  const data = (await feedResult.value.json()) as OkSurfFeedResponse;
  const videoClips = clipsResult.status === 'fulfilled' ? clipsResult.value : [];
  const usedClipIndices = new Set<number>();

  const rawItems = [
    ...(data.World ?? []),
    ...(data.Business ?? []).slice(0, 8),
  ];

  const nowIso = new Date().toISOString();
  const articles: Article[] = [];

  for (const item of rawItems) {
    const title = stripHtml(item.title ?? '');
    const link = item.link?.trim() ?? '';
    if (!title || title.length < 18 || !link) continue;

    const source = normalizeSourceName(item.source);
    const summary = `${source} correspondents report from the international desk on ${title.replace(/\.$/, '')}.`;
    const imageUrl = item.og && /^https?:\/\//i.test(item.og) ? item.og : null;

    const articleTopics = extractTopics(title);
    let matchedVideoUrl: string | null = null;

    if (articleTopics.length > 0) {
      const idx = videoClips.findIndex(
        (clip, i) =>
          !usedClipIndices.has(i) &&
          clip.topics.some((topic) => articleTopics.includes(topic)),
      );
      if (idx !== -1) {
        usedClipIndices.add(idx);
        matchedVideoUrl = videoClips[idx].url;
      }
    }

    if (!matchedVideoUrl && (articles.length === 0 || articles.length % 3 === 0)) {
      const fallbackIdx = videoClips.findIndex((_, i) => !usedClipIndices.has(i));
      if (fallbackIdx !== -1) {
        usedClipIndices.add(fallbackIdx);
        matchedVideoUrl = videoClips[fallbackIdx].url;
      }
    }

    articles.push({
      id: hashId(link),
      title,
      summary,
      paragraphs: buildBroadsheetParagraphs(title, summary, source),
      url: link,
      source,
      publishedAt: nowIso,
      media: matchedVideoUrl
        ? {
            kind: 'gif',
            src: matchedVideoUrl,
            poster: imageUrl ?? undefined,
            width: 800,
            height: 450,
          }
        : imageUrl
          ? {
              kind: articles.length % 2 === 0 ? 'gif' : 'image',
              src: imageUrl,
              width: 800,
              height: 450,
            }
          : null,
    });
  }

  return articles;
}

export async function generateClientEdition(
  requestedDateOrStamp?: string,
  signal?: AbortSignal,
): Promise<Edition> {
  const now = new Date();
  const dateIso =
    requestedDateOrStamp && /^\d{4}-\d{2}-\d{2}$/.test(requestedDateOrStamp)
      ? requestedDateOrStamp
      : formatLocalIsoDate(now);
  const stamp = toDateStamp(requestedDateOrStamp ?? dateIso);
  const timeZone = getUserTimeZone();
  const issue = computeIssueNumber(dateIso);

  const rawStories = await fetchDirectBrowserWorldNews(signal);

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const combined: Article[] = [];

  for (const item of rawStories) {
    const normTitle = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .slice(0, 46);
    if (seenIds.has(item.id) || seenTitles.has(normTitle)) continue;
    seenIds.add(item.id);
    seenTitles.add(normTitle);
    combined.push(item);
    if (combined.length >= TARGET_ARTICLE_COUNT) break;
  }

  const sources = [...new Set(combined.map((a) => a.source))].sort();

  return {
    date: dateIso,
    stamp,
    issue,
    printedAt: now.toISOString(),
    timeZone,
    sources,
    articles: combined,
    adverts: selectDailyAdverts(issue),
    decrees: selectDailyDecrees(issue),
  };
}
