declare module 'page-flip' {
  export type SizeType = 'fixed' | 'stretch';
  export type FlipCorner = 'top' | 'bottom';
  export type FlippingState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';
  export type Orientation = 'portrait' | 'landscape';

  export interface FlipSetting {
    startPage: number;
    size: SizeType;
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export interface WidgetEvent<T = number | FlippingState | Orientation | { page: number; mode: Orientation }> {
    data: T;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);
    destroy(): void;
    update(): void;
    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    clear(): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(page: number, corner?: FlipCorner): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): Orientation;
    getState(): FlippingState;
    on(event: 'flip', callback: (e: WidgetEvent<number>) => void): void;
    on(event: 'changeState', callback: (e: WidgetEvent<FlippingState>) => void): void;
    on(event: 'changeOrientation', callback: (e: WidgetEvent<Orientation>) => void): void;
    on(event: 'init' | 'update', callback: (e: WidgetEvent<{ page: number; mode: Orientation }>) => void): void;
    off(event: string): void;
  }
}
