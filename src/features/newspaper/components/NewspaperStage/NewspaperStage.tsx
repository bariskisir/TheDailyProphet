import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { PageFlip, type FlippingState } from 'page-flip';
import type { Edition, EditionManifestEntry } from '@/shared/types/edition.ts';
import { usePaperAudio } from '@/features/audio';
import { paginateDual, type EditionTarget } from '@/features/edition';
import { NewspaperPage, Sheet, type ContentsEntry } from '@/features/pages';
import { cx } from '@/shared/lib/cx.ts';
import { NewspaperToolbar } from '../NewspaperToolbar/NewspaperToolbar.tsx';
import { useViewportLayout } from '../../hooks/useViewportLayout.ts';
import './NewspaperStage.scss';

interface NewspaperStageProps {
  edition: Edition;
  availableEditions: EditionManifestEntry[];
  onSelectEdition: (stamp: string) => void;
}

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

function pageIndexToStfSlot(pageIndex: number, totalPages: number, isSpread: boolean): number {
  const clamped = clamp(pageIndex, 0, Math.max(0, totalPages - 1));
  if (!isSpread) return clamped;
  if (clamped === 0) return 0;
  if (clamped >= totalPages - 1) return totalPages;
  const slot = clamped + 1;
  return slot % 2 === 1 ? slot - 1 : slot;
}

function stfSlotToPageIndex(stfSlot: number, totalPages: number, isSpread: boolean): number {
  if (!isSpread) return clamp(stfSlot, 0, Math.max(0, totalPages - 1));
  if (stfSlot <= 0) return 0;
  return clamp(stfSlot - 1, 0, Math.max(0, totalPages - 1));
}

export function NewspaperStage({ edition, availableEditions, onSelectEdition }: NewspaperStageProps) {
  const dualPages = useMemo(() => paginateDual(edition), [edition]);
  const layout = useViewportLayout();

  const editionTarget: EditionTarget = layout.mode === 'pocket' ? 'mobile' : 'desktop';
  const pages = editionTarget === 'mobile' ? dualPages.mobile : dualPages.desktop;
  const isSpread = layout.mode === 'spread';

  const { muted, toggleMute, play, startPeel, updatePeel, endPeel } = usePaperAudio();

  const [currentPage, setCurrentPage] = useState(0);
  const [flipState, setFlipState] = useState<FlippingState>('read');
  const [pageElements, setPageElements] = useState<HTMLDivElement[]>([]);
  const [stfBlockEl, setStfBlockEl] = useState<HTMLDivElement | null>(null);
  const [arrived, setArrived] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const currentPageRef = useRef(0);
  const prevTargetRef = useRef<EditionTarget>(editionTarget);
  const prevCountRef = useRef<number>(pages.length);
  const prevStateRef = useRef<FlippingState>('read');
  const lastPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);

  currentPageRef.current = currentPage;

  const audioHandlersRef = useRef({ play, startPeel, endPeel });
  audioHandlersRef.current = { play, startPeel, endPeel };

  useEffect(() => {
    const id = window.setTimeout(() => setArrived(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (prevTargetRef.current !== editionTarget && prevCountRef.current > 1 && pages.length > 1) {
      const ratio = currentPageRef.current / (prevCountRef.current - 1);
      const mapped = clamp(Math.round(ratio * (pages.length - 1)), 0, pages.length - 1);
      currentPageRef.current = mapped;
      setCurrentPage(mapped);
    }
    prevTargetRef.current = editionTarget;
    prevCountRef.current = pages.length;
  }, [editionTarget, pages.length]);

  const contents = useMemo<ContentsEntry[]>(() => {
    const entries: ContentsEntry[] = [];
    pages.forEach((page, index) => {
      if (page.kind === 'inner' && page.articles[0]) {
        entries.push({ title: page.articles[0].title, pageNumber: index + 1 });
      } else if (page.kind === 'back' && page.briefs[0]) {
        entries.push({ title: page.briefs[0].title, pageNumber: index + 1 });
      }
    });
    return entries;
  }, [pages]);

  const totalPages = useMemo(() => {
    if (isSpread && pages.length % 2 === 1) {
      return pages.length + 1;
    }
    return pages.length;
  }, [isSpread, pages.length]);

  const stfSlotCount = isSpread ? totalPages + 2 : totalPages;

  useEffect(() => {
    if (stfSlotCount === 0) {
      setPageElements([]);
      return;
    }
    const containers: HTMLDivElement[] = [];
    for (let slot = 0; slot < stfSlotCount; slot++) {
      const isEmptySlot = isSpread && (slot === 0 || slot === stfSlotCount - 1);
      const pageEl = document.createElement('div');
      pageEl.className = isEmptySlot
        ? 'newspaper__stf-page newspaper__stf-page--empty'
        : 'newspaper__stf-page';
      pageEl.dataset.density = 'soft';
      containers.push(pageEl);
    }
    setPageElements(containers);
  }, [edition.stamp, editionTarget, isSpread, layout.pageHeight, layout.pageWidth, stfSlotCount]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || pageElements.length === 0) return;

    host.innerHTML = '';
    const totalWidth = isSpread ? layout.pageWidth * 2 : layout.pageWidth;

    const mountEl = document.createElement('div');
    mountEl.className = 'newspaper__stf-mount';
    mountEl.style.width = `${totalWidth}px`;
    mountEl.style.height = `${layout.pageHeight}px`;
    host.appendChild(mountEl);

    const startSlot = pageIndexToStfSlot(currentPageRef.current, totalPages, isSpread);
    const initialLogicalPage = stfSlotToPageIndex(startSlot, totalPages, isSpread);

    const instance = new PageFlip(mountEl, {
      width: layout.pageWidth,
      height: layout.pageHeight,
      size: 'fixed',
      minWidth: layout.pageWidth,
      maxWidth: layout.pageWidth,
      minHeight: layout.pageHeight,
      maxHeight: layout.pageHeight,
      drawShadow: true,
      flippingTime: layout.mode === 'pocket' ? 680 : 820,
      usePortrait: !isSpread,
      startPage: startSlot,
      startZIndex: 2,
      autoSize: false,
      maxShadowOpacity: 0.72,
      showCover: false,
      mobileScrollSupport: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 24,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    instance.loadFromHTML(pageElements);
    setCurrentPage(initialLogicalPage);

    const blockEl = mountEl.querySelector<HTMLDivElement>('.stf__block');
    setStfBlockEl(blockEl);

    instance.on('flip', (event) => {
      const nextSlot = Number(event.data);
      if (Number.isFinite(nextSlot)) {
        setCurrentPage(stfSlotToPageIndex(nextSlot, totalPages, isSpread));
      }
    });

    instance.on('changeState', (event) => {
      const nextState = event.data;
      const prevState = prevStateRef.current;
      prevStateRef.current = nextState;
      setFlipState(nextState);

      const audio = audioHandlersRef.current;
      if (nextState === 'user_fold' && prevState !== 'user_fold') {
        audio.startPeel();
      } else if (nextState === 'flipping') {
        if (prevState === 'user_fold') {
          audio.endPeel(true);
        } else {
          audio.play('turn-next');
        }
      } else if (nextState === 'read' && prevState === 'user_fold') {
        audio.endPeel(false);
      }
    });

    pageFlipRef.current = instance;

    return () => {
      setStfBlockEl(null);
      pageFlipRef.current = null;
      prevStateRef.current = 'read';
      setFlipState('read');
      try {
        instance.destroy();
      } catch {
        return;
      }
      host.innerHTML = '';
    };
  }, [isSpread, layout.mode, layout.pageHeight, layout.pageWidth, pageElements, totalPages]);

  const onStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prevStateRef.current !== 'user_fold') {
      lastPointerRef.current = null;
      return;
    }
    const now = performance.now();
    const last = lastPointerRef.current;
    if (last) {
      const dt = Math.max(1, now - last.time);
      const dist = Math.hypot(event.clientX - last.x, event.clientY - last.y);
      const speed = (dist / dt) * (1000 / Math.max(320, layout.pageWidth));
      updatePeel(speed, 0.5);
    }
    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now };
  };

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  const goToPage = useCallback(
    (rawTarget: number) => {
      const target = clamp(rawTarget, 0, totalPages - 1);
      const cur = currentPageRef.current;
      if (isSpread) {
        const isInnerSpread = cur > 0 && cur < totalPages - 1;
        if (target === cur || (isInnerSpread && target === cur + 1)) return;
      } else if (target === cur) {
        return;
      }
      const targetSlot = pageIndexToStfSlot(target, totalPages, isSpread);
      pageFlipRef.current?.flip(targetSlot, 'bottom');
    },
    [isSpread, totalPages],
  );

  const handleNext = useCallback(() => {
    if (!canNext) return;
    pageFlipRef.current?.flipNext('bottom');
  }, [canNext]);

  const handlePrev = useCallback(() => {
    if (!canPrev) return;
    pageFlipRef.current?.flipPrev('bottom');
  }, [canPrev]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      ) {
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToPage(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToPage(totalPages - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToPage, handleNext, handlePrev, totalPages]);

  const unitPx = layout.pageWidth / 100;
  const stageVars: CSSProperties = {
    ['--u' as string]: `${unitPx}px`,
    ['--page-w' as string]: `${layout.pageWidth}px`,
    ['--page-h' as string]: `${layout.pageHeight}px`,
  };

  const renderSlotContent = (slotIndex: number) => {
    if (isSpread && (slotIndex === 0 || slotIndex === stfSlotCount - 1)) {
      return null;
    }
    const pageIndex = isSpread ? slotIndex - 1 : slotIndex;
    const side: 'left' | 'right' | 'single' =
      isSpread ? (pageIndex % 2 === 0 ? 'right' : 'left') : 'single';
    const model = pages[pageIndex];
    if (!model) {
      return <Sheet side={side} label="Blank newsprint" />;
    }
    return (
      <NewspaperPage
        edition={edition}
        page={model}
        contents={contents}
        context={{ pageNumber: pageIndex + 1, side }}
        onSelectPage={(pageNumber) => goToPage(pageNumber - 1)}
      />
    );
  };

  const hasLeftSheet = isSpread && currentPage > 0;
  const hasRightSheet = isSpread && currentPage < totalPages - 1;
  const blockEmptyLeft = isSpread && !hasLeftSheet && flipState === 'read';
  const blockEmptyRight = isSpread && !hasRightSheet && flipState === 'read';

  const absorbDeskEvent = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <main
      className={cx(
        'newspaper',
        `newspaper--${layout.mode}`,
        `newspaper--target-${editionTarget}`,
        arrived && 'is-arrived',
        flipState === 'user_fold' && 'is-dragging',
      )}
      style={stageVars}
      onPointerMove={onStagePointerMove}
      data-desktop-pages={dualPages.desktop.length}
      data-mobile-pages={dualPages.mobile.length}
    >
      <div className="newspaper__desk-glow" aria-hidden="true" />

      <div className="newspaper__stage">
        <div
          className={cx(
            'newspaper__book',
            isSpread ? 'newspaper__book--spread' : 'newspaper__book--single',
          )}
        >
          {isSpread && (
            <>
              <div
                className={cx('newspaper__deck', 'newspaper__deck--left', hasLeftSheet && 'is-visible')}
                aria-hidden="true"
              />
              <div
                className={cx('newspaper__deck', 'newspaper__deck--right', hasRightSheet && 'is-visible')}
                aria-hidden="true"
              />
            </>
          )}

          <div ref={hostRef} className="newspaper__stf-host" />

          {blockEmptyLeft && (
            <div
              className="newspaper__empty-guard newspaper__empty-guard--left"
              onMouseDown={absorbDeskEvent}
              onMouseMove={absorbDeskEvent}
              onTouchStart={absorbDeskEvent}
              aria-hidden="true"
            />
          )}

          {blockEmptyRight && (
            <div
              className="newspaper__empty-guard newspaper__empty-guard--right"
              onMouseDown={absorbDeskEvent}
              onMouseMove={absorbDeskEvent}
              onTouchStart={absorbDeskEvent}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {pageElements.map((containerEl, slotIndex) =>
        createPortal(
          renderSlotContent(slotIndex),
          containerEl,
          `stf-slot-${edition.stamp}-${editionTarget}-${slotIndex}`,
        ),
      )}

      {isSpread && hasLeftSheet && hasRightSheet && stfBlockEl &&
        createPortal(
          <div className="newspaper__spine" aria-hidden="true" />,
          stfBlockEl,
        )
      }

      <NewspaperToolbar
        editionDate={edition.date}
        currentStamp={edition.stamp}
        availableEditions={availableEditions}
        currentPage={currentPage}
        totalPages={totalPages}
        mode={layout.mode}
        muted={muted}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelectPage={goToPage}
        onSelectEdition={(stamp) => {
          play('unfold');
          setCurrentPage(0);
          onSelectEdition(stamp);
        }}
        onToggleMute={toggleMute}
      />
    </main>
  );
}
