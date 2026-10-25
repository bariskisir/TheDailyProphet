import type { OrnamentProps } from './types.ts';

export function Fleuron(props: OrnamentProps) {
  return (
    <svg viewBox="0 0 60 20" aria-hidden="true" focusable="false" {...props}>
      <g fill="currentColor">
        <path d="M30 3 C25.5 7.5 25.5 12.5 30 17 C34.5 12.5 34.5 7.5 30 3 Z" />
        <path d="M24 10 C18 3.5 10 5.5 5.5 10 C10 14.5 18 16.5 24 10 Z" opacity="0.85" />
        <path d="M36 10 C42 3.5 50 5.5 54.5 10 C50 14.5 42 16.5 36 10 Z" opacity="0.85" />
        <circle cx="1.8" cy="10" r="1.5" />
        <circle cx="58.2" cy="10" r="1.5" />
      </g>
    </svg>
  );
}
