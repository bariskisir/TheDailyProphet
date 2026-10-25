import type { OrnamentProps } from './types.ts';

export function Flourish({ mirrored = false, style, ...props }: OrnamentProps & { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 220 64" aria-hidden="true" focusable="false" style={{ ...style, transform: mirrored ? 'scaleX(-1)' : undefined }} {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2.6" d="M216 32 C192 32 182 10 156 10 C132 10 124 36 142 43 C156 48 165 34 156 26 C149 20 137 27 143 33" />
        <path strokeWidth="1.6" d="M216 32 C194 33 184 54 158 54 C138 54 126 45 116 32 C104 17 88 12 72 19 C56 26 54 45 68 47 C80 49 85 37 77 32" />
        <path strokeWidth="1.2" d="M116 32 C98 37 78 41 56 37 C38 34 24 28 6 32" />
        <path strokeWidth="1.1" d="M168 32 C158 22 168 15 175 22 M168 32 C158 42 168 49 175 42" />
        <path strokeWidth="1" d="M94 23 C89 11 101 4 106 14 M94 41 C89 53 101 60 106 50" />
        <path strokeWidth="0.8" d="M134 18 C128 12 120 14 118 20 M134 46 C128 52 120 50 118 44" />
      </g>
      <g fill="currentColor">
        <circle cx="5" cy="32" r="3" />
        <circle cx="20" cy="30.5" r="1.6" />
        <path d="M30 32 l7 -3.5 l7 3.5 l-7 3.5 z" />
        <circle cx="216" cy="32" r="2.4" />
      </g>
    </svg>
  );
}
