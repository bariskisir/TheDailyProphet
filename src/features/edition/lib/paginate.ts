import type { Article, Edition } from '@/shared/types/edition.ts';
import type { DualEditionPages, InnerLayout, InnerPageModel, PageModel } from '../types.ts';

const SECTIONS = [
  'International Affairs',
  'Dispatches from Abroad',
  'News from Far-Flung Lands',
  'Reports from the Continent',
  'Owl Post Bulletins',
  'The World at Large',
  'Late Owl Editions',
  'Foreign Correspondence',
  'Rumours & Reports',
  'Ministry & Diplomatic Wire',
];

const DESKTOP_LAYOUT_CYCLE: readonly InnerLayout[] = ['feature', 'trio', 'mosaic'];
const DESKTOP_STORIES_PER_LAYOUT: Record<'feature' | 'trio' | 'mosaic', number> = {
  feature: 3,
  trio: 3,
  mosaic: 4,
};
const DESKTOP_FRONT_BRIEFS = 2;
const DESKTOP_BACK_BRIEFS = 3;

const MOBILE_LAYOUT_CYCLE: readonly ('mobile-solo' | 'mobile-duo')[] = [
  'mobile-solo',
  'mobile-duo',
  'mobile-duo',
];
const MOBILE_BACK_BRIEFS = 2;

const isMoving = (article: Article): boolean => article.media?.kind === 'gif';

function promote(queue: Article[], predicate: (article: Article) => boolean, lookahead = 6): void {
  const index = queue.slice(0, lookahead).findIndex(predicate);
  if (index > 0) queue.unshift(...queue.splice(index, 1));
}

export function paginateDesktop(edition: Edition): PageModel[] {
  const queue = [...edition.articles];
  const pages: PageModel[] = [];
  if (queue.length === 0) return pages;

  const lead = queue.shift()!;
  let picture: Article | null = null;
  if (!isMoving(lead)) {
    const index = queue.slice(0, 8).findIndex(isMoving);
    if (index >= 0) picture = queue.splice(index, 1)[0];
  }
  pages.push({
    kind: 'front',
    target: 'desktop',
    lead,
    picture,
    briefs: queue.splice(0, DESKTOP_FRONT_BRIEFS),
  });

  const innerPages: InnerPageModel[] = [];
  for (let index = 0; queue.length > DESKTOP_BACK_BRIEFS; index++) {
    const layout = DESKTOP_LAYOUT_CYCLE[index % DESKTOP_LAYOUT_CYCLE.length] as
      | 'feature'
      | 'trio'
      | 'mosaic';
    promote(queue, (article) => article.media !== null);
    if (index % 2 === 0) promote(queue, isMoving, 4);
    innerPages.push({
      kind: 'inner',
      target: 'desktop',
      section: SECTIONS[index % SECTIONS.length],
      layout,
      articles: queue.splice(0, DESKTOP_STORIES_PER_LAYOUT[layout]),
      advert: index,
    });
  }

  if (innerPages.length % 2 === 1) {
    const donorIndex = innerPages.findIndex((p) => p.articles.length >= 4);
    const targetIdx = donorIndex !== -1 ? donorIndex : innerPages.findIndex((p) => p.articles.length >= 2);
    if (targetIdx !== -1) {
      const donor = innerPages[targetIdx];
      const splitIndex = Math.ceil(donor.articles.length / 2);
      const extraArticles = donor.articles.splice(splitIndex);
      donor.layout = 'feature';
      innerPages.splice(targetIdx + 1, 0, {
        kind: 'inner',
        target: 'desktop',
        section: SECTIONS[(innerPages.length + 1) % SECTIONS.length],
        layout: 'trio',
        articles: extraArticles,
        advert: innerPages.length,
      });
    }
  }

  pages.push(...innerPages);
  pages.push({ kind: 'back', target: 'desktop', briefs: queue.splice(0) });
  return pages;
}

export function paginateMobile(edition: Edition): PageModel[] {
  const queue = [...edition.articles];
  const pages: PageModel[] = [];
  if (queue.length === 0) return pages;

  const lead = queue.shift()!;
  let picture: Article | null = null;
  if (!isMoving(lead)) {
    const index = queue.slice(0, 8).findIndex(isMoving);
    if (index >= 0) picture = queue.splice(index, 1)[0];
  }

  pages.push({
    kind: 'front',
    target: 'mobile',
    lead,
    picture,
    briefs: [],
  });

  for (let index = 0; queue.length > MOBILE_BACK_BRIEFS; index++) {
    promote(queue, (article) => article.media !== null, 4);
    const hasGifAtFront = queue[0] ? isMoving(queue[0]) : false;
    const baseLayout = MOBILE_LAYOUT_CYCLE[index % MOBILE_LAYOUT_CYCLE.length];
    const layout: 'mobile-solo' | 'mobile-duo' = hasGifAtFront ? 'mobile-solo' : baseLayout;

    const takeCount = layout === 'mobile-solo' ? 1 : 2;

    pages.push({
      kind: 'inner',
      target: 'mobile',
      section: SECTIONS[index % SECTIONS.length],
      layout,
      articles: queue.splice(0, Math.min(takeCount, Math.max(1, queue.length - MOBILE_BACK_BRIEFS))),
      advert: index,
    });
  }

  pages.push({ kind: 'back', target: 'mobile', briefs: queue.splice(0) });
  return pages;
}

export function paginateDual(edition: Edition): DualEditionPages {
  return {
    desktop: paginateDesktop(edition),
    mobile: paginateMobile(edition),
  };
}
