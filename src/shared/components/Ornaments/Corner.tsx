import type { OrnamentProps } from './types.ts';

export function Corner(props: OrnamentProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path strokeWidth="2" d="M2 38 V2 H38" />
        <path strokeWidth="1" d="M7 38 V7 H38" />
        <path strokeWidth="1.2" d="M7 7 C16 7 20 12 18 18 C16 22 11 20 12 16 C13 13 16 14 15.5 16" />
        <path strokeWidth="0.9" d="M22 7 C26 12 30 12 34 9 M7 22 C12 26 12 30 9 34" />
      </g>
      <circle cx="2" cy="2" r="2.2" fill="currentColor" />
    </svg>
  );
}
