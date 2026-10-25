export type MediaKind = 'image' | 'gif';

export interface ArticleMedia {
  kind: MediaKind;
  src: string;
  poster?: string;
  width: number;
  height: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  url: string;
  source: string;
  publishedAt: string;
  media: ArticleMedia | null;
}

export interface EditionAdvert {
  title: string;
  tagline: string;
  body: string;
  address: string;
}

export interface EditionDecree {
  number: string;
  title: string;
  body: string;
}

export interface Edition {
  date: string;
  stamp: string;
  issue: number;
  printedAt: string;
  timeZone: string;
  sources: string[];
  articles: Article[];
  adverts: EditionAdvert[];
  decrees: EditionDecree[];
}

export interface EditionManifestEntry {
  date: string;
  stamp: string;
  issue: number;
  printedAt: string;
  articleCount: number;
}

export const toDateStamp = (dateOrStamp: string): string =>
  dateOrStamp.replace(/\D/g, '').slice(0, 8);
