import type { Article } from '@/shared/types/edition.ts';

export type InnerLayout =
  | 'feature'
  | 'trio'
  | 'mosaic'
  | 'mobile-solo'
  | 'mobile-duo';

export type EditionTarget = 'desktop' | 'mobile';

export interface FrontPageModel {
  kind: 'front';
  target: EditionTarget;
  lead: Article;

  picture: Article | null;
  briefs: Article[];
}

export interface InnerPageModel {
  kind: 'inner';
  target: EditionTarget;
  section: string;
  layout: InnerLayout;
  articles: Article[];

  advert: number;
}

export interface BackPageModel {
  kind: 'back';
  target: EditionTarget;
  briefs: Article[];
}

export type PageModel = FrontPageModel | InnerPageModel | BackPageModel;

export interface DualEditionPages {
  desktop: PageModel[];
  mobile: PageModel[];
}
