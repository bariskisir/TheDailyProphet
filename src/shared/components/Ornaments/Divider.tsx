import type { OrnamentProps } from './types.ts';

export function Divider(props: OrnamentProps) {
  return (
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true" focusable="false" {...props}>
      <g stroke="currentColor" fill="none" vectorEffect="non-scaling-stroke">
        <path strokeWidth="1.4" d="M0 10 H168 M232 10 H400" />
        <path strokeWidth="0.7" d="M24 6 H170 M230 6 H376 M24 14 H170 M230 14 H376" />
        <path strokeWidth="1.4" d="M174 10 C185 -1 194 -1 200 10 C206 21 215 21 226 10 C215 -1 206 -1 200 10 C194 21 185 21 174 10 Z" />
      </g>
      <circle cx="200" cy="10" r="2.4" fill="currentColor" />
    </svg>
  );
}
