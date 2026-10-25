import type { ReactNode } from 'react';
import { cx } from '@/shared/lib/cx.ts';
import './Sheet.scss';

export type SheetSide = 'left' | 'right' | 'single';

interface SheetProps {
  side: SheetSide;
  className?: string;
  label?: string;
  children?: ReactNode;
}

export function Sheet({ side, className, label, children }: SheetProps) {
  return (
    <div className={cx('sheet', `sheet--${side}`, className)} role={label ? 'region' : undefined} aria-label={label}>
      <div className="sheet__content">{children}</div>
    </div>
  );
}
