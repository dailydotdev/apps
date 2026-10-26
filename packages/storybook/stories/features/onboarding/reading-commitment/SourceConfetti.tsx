import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

// Real source logos from daily.dev, so the burst reads as "your feed".
const LOGOS = [
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_js',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/aws',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_native',
  'https://media.daily.dev/image/upload/s--3luD3Wei--/f_auto/v1714800008/logos/duckdb',
  'https://media.daily.dev/image/upload/s--65EDghou--/f_auto/v1724339118/logos/neontech',
  'https://media.daily.dev/image/upload/s---oEn9czC--/f_auto/v1716187892/logos/socketdev',
  'https://media.daily.dev/image/upload/s--2Z0xk_Ia--/f_auto,q_auto/v1780213485/logos/jetbrains-dotnet?_a=BAMAMiWQ0',
  'https://media.daily.dev/image/upload/s--8Aro536C--/f_auto,q_auto/v1773839403/logos/golang_digest?_a=BAMAMiiu0',
];

// Deterministic, so every run and every still looks the same.
const PIECES = Array.from({ length: 22 }, (_, index) => {
  const angle = -Math.PI * (0.08 + (0.84 * index) / 21) + (index % 3) * 0.07;
  return {
    id: index,
    logo: LOGOS[index % LOGOS.length],
    dx: Math.round(Math.cos(angle) * (120 + (index % 5) * 26)),
    dy: Math.round(Math.sin(angle) * (70 + (index % 4) * 22)),
    spin: (index % 2 ? 1 : -1) * (120 + (index % 5) * 60),
    delay: (index % 4) * 50,
    duration: 1500 + (index % 5) * 160,
    size: [1.75, 2.25, 1.5, 2][index % 4],
  };
});

const css = `
@keyframes rc-burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(0); }
  12% { opacity: 1; }
  35% {
    opacity: 1;
    transform: translate(calc(-50% + var(--rc-dx) * 0.8), calc(-50% + var(--rc-dy) * 0.85))
      scale(1) rotate(calc(var(--rc-spin) * 0.4));
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--rc-dx)), calc(-50% + var(--rc-dy) + 15rem))
      scale(0.85) rotate(var(--rc-spin));
  }
}
.rc-piece {
  animation: rc-burst var(--rc-duration) cubic-bezier(0.2, 0.7, 0.3, 1) var(--rc-delay) both;
}
/* A still: hold every piece mid-flight. */
.rc-frozen .rc-piece {
  animation-delay: calc(var(--rc-duration) * -0.33);
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .rc-piece { animation: none; opacity: 0; }
}
`;

/**
 * A burst of source logos from the middle of its positioned parent: up and
 * out, then falling away. `isFrozen` holds it mid-burst for stills.
 */
export const SourceConfetti = ({
  isFrozen,
}: {
  isFrozen?: boolean;
}): ReactElement => (
  <span
    aria-hidden
    className={`pointer-events-none absolute left-1/2 top-1/2 z-2 ${
      isFrozen ? 'rc-frozen' : ''
    }`}
  >
    <style>{css}</style>
    {PIECES.map(({ id, logo, dx, dy, spin, delay, duration, size }) => (
      <img
        key={id}
        src={logo}
        alt=""
        className="rc-piece absolute left-0 top-0 max-w-none rounded-full border-2 border-background-default bg-background-default shadow-2"
        style={
          {
            width: `${size}rem`,
            height: `${size}rem`,
            '--rc-dx': `${dx}px`,
            '--rc-dy': `${dy}px`,
            '--rc-spin': `${spin}deg`,
            '--rc-delay': `${delay}ms`,
            '--rc-duration': `${duration}ms`,
          } as CSSProperties
        }
      />
    ))}
  </span>
);
