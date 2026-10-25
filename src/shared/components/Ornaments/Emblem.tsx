import type { OrnamentProps } from './types.ts';

export function Emblem(props: OrnamentProps) {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="1.8" d="M54 42 C38 26 20 21 3 26 C14 31 21 35 26 40 C14 40 7 45 3 52 C17 49 28 50 37 54 C28 58 24 65 22 72 C36 65 47 58 56 51" />
        <path strokeWidth="0.9" d="M45 37 C34 31 23 29 13 30 M43 46 C31 44 20 45 11 49 M47 53 C38 57 31 62 29 67" />
        <path strokeWidth="1.8" d="M86 42 C102 26 120 21 137 26 C126 31 119 35 114 40 C126 40 133 45 137 52 C123 49 112 50 103 54 C112 58 116 65 118 72 C104 65 93 58 84 51" />
        <path strokeWidth="0.9" d="M95 37 C106 31 117 29 127 30 M97 46 C109 44 120 45 129 49 M93 53 C102 57 109 62 111 67" />
        <path strokeWidth="2" d="M50 42 C59 30 81 30 90 42 C81 54 59 54 50 42 Z" />
        <path strokeWidth="1.1" d="M70 22 V12 M58 25 L53 17 M82 25 L87 17 M64 23 L62 14 M76 23 L78 14" />
      </g>
      <circle cx="70" cy="42" r="7" fill="currentColor" />
      <circle cx="67.5" cy="39.5" r="2" fill="var(--paper)" />
    </svg>
  );
}
