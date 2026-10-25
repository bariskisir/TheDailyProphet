export interface ContentsEntry {
  title: string;
  pageNumber: number;
}

export interface PageContext {

  pageNumber: number;
  side: 'left' | 'right' | 'single';
}
