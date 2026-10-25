import { useEffect, useState } from 'react';

export type ReadingMode = 'spread' | 'single' | 'pocket';

export interface ViewportLayout {
  mode: ReadingMode;
  pageWidth: number;
  pageHeight: number;
}

const PAGE_ASPECT = 1.38;
const MOBILE_PAGE_ASPECT = 1.46;

function measure(): ViewportLayout {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  if (vw < 768) {
    const availW = Math.max(280, vw - 16);
    const availH = Math.max(400, vh - 68);
    const maxPageWFromWidth = availW;
    const maxPageWFromHeight = availH / MOBILE_PAGE_ASPECT;
    const pageWidth = Math.floor(Math.min(maxPageWFromWidth, maxPageWFromHeight));
    const pageHeight = Math.floor(pageWidth * MOBILE_PAGE_ASPECT);

    return {
      mode: 'pocket',
      pageWidth,
      pageHeight,
    };
  }

  const canSpread = vw >= 760 && vw / vh >= 1.02;
  const mode: ReadingMode = canSpread ? 'spread' : 'single';

  const horizontalMargin = vw < 960 ? 28 : 56;
  const verticalMargin = vh < 720 ? 64 : 82;
  const availW = Math.max(320, vw - horizontalMargin);
  const availH = Math.max(420, vh - verticalMargin);

  if (mode === 'spread') {
    const maxPageWFromWidth = availW / 2;
    const maxPageWFromHeight = availH / PAGE_ASPECT;
    const pageWidth = Math.floor(Math.min(maxPageWFromWidth, maxPageWFromHeight));
    const pageHeight = Math.floor(pageWidth * PAGE_ASPECT);
    return { mode, pageWidth, pageHeight };
  }

  const maxPageWFromWidth = availW;
  const maxPageWFromHeight = availH / PAGE_ASPECT;
  const pageWidth = Math.floor(Math.min(maxPageWFromWidth, maxPageWFromHeight));
  const pageHeight = Math.floor(pageWidth * PAGE_ASPECT);
  return { mode, pageWidth, pageHeight };
}

export function useViewportLayout(): ViewportLayout {
  const [layout, setLayout] = useState<ViewportLayout>(() => measure());

  useEffect(() => {
    const update = () => setLayout(measure());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return layout;
}
