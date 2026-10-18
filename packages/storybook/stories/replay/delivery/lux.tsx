import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

type Entry = { onOpen: () => void };

/**
 * The aurora, made small and expensive. Nothing here shows a card. Each
 * object is black lacquer with a hairline edge, a lit top lip and the week's
 * colours moving under glass, and each carries one abstract mark that says
 * "there is something about you in here": an orb, rings, a lit grid, a seal,
 * a stack, an aperture. Copy is one line or none.
 */

export const WEEK_HUES = ['#4A7EEE', '#DD5143', '#29D8E5', '#CE3DF3'];

export const LACQUER = '#0B0B0F';
const EDGE = 'inset 0 0 0 1px rgba(255,255,255,.14), inset 0 1px 0 rgba(255,255,255,.22)';
const DEPTH = '0 18px 40px -18px rgba(11,11,15,.7), 0 2px 6px -2px rgba(11,11,15,.5)';
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .06 0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")";

export const LuxStyles = (): ReactElement => (
  <style>{`
@keyframes lxDrift { 0% { transform: translate(-8%, -6%) scale(1); } 100% { transform: translate(8%, 6%) scale(1.15); } }
@keyframes lxRing { 0% { transform: scale(.55); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }
@keyframes lxBlink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes lxSheen { 0% { transform: translateX(-140%) skewX(-18deg); } 100% { transform: translateX(240%) skewX(-18deg); } }
.lx-aurora > * { animation: lxDrift 11s ease-in-out infinite alternate; }
.lx-aurora > :nth-child(2) { animation-duration: 15s; animation-direction: alternate-reverse; }
.lx-aurora > :nth-child(3) { animation-duration: 19s; }
.lx-ring { animation: lxRing 2.8s cubic-bezier(.2,.7,.2,1) infinite; }
.lx-ring:nth-child(2) { animation-delay: .9s; }
.lx-ring:nth-child(3) { animation-delay: 1.8s; }
.lx-blink { animation: lxBlink 2.6s ease-in-out infinite; }
.lx-sheen::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent); animation: lxSheen 6s ease-in-out infinite; pointer-events: none; }
.lx-sheen-bright::after { content: ''; position: absolute; top: 0; bottom: 0; width: 28%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.38) 50%, transparent); animation: lxSheen 3.4s cubic-bezier(.4,0,.2,1) infinite; pointer-events: none; }
@keyframes lxGlow { 0%, 100% { box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 0 rgba(74,126,238,0), 0 18px 40px -18px rgba(11,11,15,.7); } 50% { box-shadow: inset 0 0 0 1px rgba(255,255,255,.3), inset 0 1px 0 rgba(255,255,255,.3), 0 0 22px 2px rgba(74,126,238,.35), 0 0 46px 6px rgba(206,61,243,.18), 0 18px 40px -18px rgba(11,11,15,.7); } }
.lx-glow { animation: lxGlow 3.2s ease-in-out infinite; }
.lx-tick { animation: lxBlink 2.2s ease-in-out infinite; }
.lx-hover { transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s; }
.lx-hover:hover { transform: translateY(-1px); }
@media (prefers-reduced-motion: reduce) { .lx-aurora > *, .lx-ring, .lx-blink, .lx-tick, .lx-glow, .lx-sheen::after, .lx-sheen-bright::after { animation: none; } }
  `}</style>
);

/** The week's colours under glass. Clipped by whatever it sits in. */
export const Aurora = ({ intensity = 0.7, blur = 18 }: { intensity?: number; blur?: number }): ReactElement => (
  <span className="lx-aurora pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    {WEEK_HUES.slice(0, 3).map((hue, index) => (
      <span
        key={hue}
        className="absolute rounded-[999px]"
        style={{ left: `${index * 30 - 15}%`, top: `${index % 2 ? 20 : -40}%`, width: '70%', height: '160%', background: hue, filter: `blur(${blur}px)`, opacity: intensity, mixBlendMode: 'screen' }}
      />
    ))}
    <span className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.5, mixBlendMode: 'overlay' }} />
  </span>
);

/** Black lacquer with a hairline edge and a lit top lip. */
export const Lacquer = ({
  children,
  className,
  style,
  radius = 14,
  onClick,
  title,
  sheen = false,
  glint,
  absolute = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number;
  onClick?: () => void;
  title?: string;
  sheen?: boolean;
  /** How the object asks for attention: the slow sweep, a brighter faster sweep, or a breathing edge in the week's hues. */
  glint?: 'sweep' | 'bright' | 'edge';
  /** Positioned by the caller (overlays); otherwise the object is its own positioning context. */
  absolute?: boolean;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={classNames('lx-hover overflow-hidden text-left text-white', (sheen || glint === 'sweep') && 'lx-sheen', glint === 'bright' && 'lx-sheen-bright', glint === 'edge' && 'lx-glow', className)}
    style={{ position: absolute ? 'absolute' : 'relative', background: LACQUER, borderRadius: radius, boxShadow: `${EDGE}, ${DEPTH}`, ...style }}
  >
    {children}
  </button>
);

const Label = ({ children, dim = false }: { children: ReactNode; dim?: boolean }): ReactElement => (
  <span className="whitespace-nowrap font-mono uppercase tracking-[0.18em] typo-caption2" style={{ color: dim ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.9)', fontSize: 10 }}>
    {children}
  </span>
);

/* -------------------------------------------------------------------------- */
/* Marks: the thing inside that says "about you"                               */
/* -------------------------------------------------------------------------- */

/** An orb: the week under a glass dome. */
export const Orb = ({ size = 28 }: { size?: number }): ReactElement => (
  <span className="relative block overflow-hidden rounded-[999px]" style={{ width: size, height: size, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18), inset 0 2px 4px rgba(255,255,255,.25), 0 6px 14px -6px rgba(0,0,0,.6)' }}>
    <Aurora intensity={0.9} blur={size * 0.32} />
    <span className="absolute rounded-[999px]" style={{ left: '22%', top: '14%', width: '36%', height: '22%', background: 'rgba(255,255,255,.55)', filter: 'blur(1.5px)' }} />
  </span>
);

/** Rings: a signal, going out from a point. */
export const Rings = ({ size = 28 }: { size?: number }): ReactElement => (
  <span className="relative block" style={{ width: size, height: size }}>
    {[0, 1, 2].map((ring) => (
      <span key={ring} className="lx-ring absolute inset-0 rounded-[999px]" style={{ border: '1px solid rgba(255,255,255,.7)' }} />
    ))}
    <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[999px] bg-white" style={{ boxShadow: '0 0 8px 2px rgba(255,255,255,.6)' }} />
  </span>
);

/** A grid of nine, five of them lit: five highlights, without showing one. */
export const LitGrid = ({ size = 28, lit = [0, 2, 4, 6, 8] }: { size?: number; lit?: number[] }): ReactElement => (
  <span className="grid grid-cols-3" style={{ width: size, height: size, gap: size * 0.12 }}>
    {Array.from({ length: 9 }).map((_, index) => {
      const on = lit.includes(index);
      return (
        <span
          key={index}
          className={classNames('rounded-[2px]', on && 'lx-blink')}
          style={{ background: on ? WEEK_HUES[lit.indexOf(index) % WEEK_HUES.length] : 'rgba(255,255,255,.12)', animationDelay: `${index * 0.3}s`, boxShadow: on ? `0 0 6px ${WEEK_HUES[lit.indexOf(index) % WEEK_HUES.length]}` : undefined }}
        />
      );
    })}
  </span>
);

/** Three squares, offset: a set of things, face down. */
export const Stack = ({ size = 28 }: { size?: number }): ReactElement => (
  <span className="relative block" style={{ width: size, height: size }}>
    {[2, 1, 0].map((layer) => (
      <span
        key={layer}
        className="absolute overflow-hidden"
        style={{ left: layer * (size * 0.16), top: layer * (size * 0.12), width: size * 0.66, height: size * 0.72, borderRadius: size * 0.12, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.22)', opacity: 1 - layer * 0.25 }}
      >
        {layer === 0 && <Aurora intensity={0.9} blur={size * 0.25} />}
      </span>
    ))}
  </span>
);

/** A seal: the week number in a thin ring. */
export const Seal = ({ size = 32, week = 37 }: { size?: number; week?: number }): ReactElement => (
  <span className="relative flex items-center justify-center overflow-hidden rounded-[999px]" style={{ width: size, height: size, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.28)' }}>
    <Aurora intensity={0.55} blur={size * 0.3} />
    <span className="relative font-mono font-bold text-white" style={{ fontSize: size * 0.3, letterSpacing: '-0.02em' }}>
      {week}
    </span>
    <span className="absolute inset-[3px] rounded-[999px]" style={{ border: '1px solid rgba(255,255,255,.18)' }} />
  </span>
);

/** An aperture: black, with a slit of colour. Something to look into. */
export const Aperture = ({ size = 28 }: { size?: number }): ReactElement => (
  <span className="relative block overflow-hidden" style={{ width: size, height: size, borderRadius: size * 0.28, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)' }}>
    <span className="absolute overflow-hidden rounded-[999px]" style={{ left: '30%', top: '18%', width: '40%', height: '64%' }}>
      <Aurora intensity={1} blur={size * 0.2} />
    </span>
  </span>
);

/* -------------------------------------------------------------------------- */
/* Rectangular marks: a card's back, a ledger, a plate                        */
/* -------------------------------------------------------------------------- */

/** The back of one card, 4:5, the week under it. A card without showing one. */
export const CardBack = ({ width = 22, tilt = 0 }: { width?: number; tilt?: number }): ReactElement => (
  <span
    className="relative block overflow-hidden"
    style={{ width, height: width * 1.25, borderRadius: width * 0.18, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.28), 0 6px 14px -6px rgba(0,0,0,.7)', transform: tilt ? `rotate(${tilt}deg)` : undefined }}
  >
    <Aurora intensity={0.85} blur={width * 0.3} />
    <span className="absolute" style={{ inset: width * 0.14, borderRadius: width * 0.1, border: '1px solid rgba(255,255,255,.22)' }} />
  </span>
);

/** Three card backs, fanned. Five highlights in there, none shown. */
export const Fan = ({ width = 24 }: { width?: number }): ReactElement => (
  <span className="relative block" style={{ width: width * 1.9, height: width * 1.35 }}>
    {[-14, 0, 14].map((tilt, index) => (
      <span key={tilt} className="absolute" style={{ left: index * (width * 0.42), top: index === 1 ? 0 : width * 0.08, transformOrigin: 'bottom center', opacity: index === 1 ? 1 : 0.8 }}>
        <CardBack width={width} tilt={tilt} />
      </span>
    ))}
  </span>
);

/** A ledger: five vertical bars in the week's hues, each a share of the week. */
export const Ledger = ({ size = 28, shares = [0.63, 0.17, 0.11, 0.06, 0.03] }: { size?: number; shares?: number[] }): ReactElement => (
  <span className="flex items-end" style={{ width: size, height: size, gap: size * 0.09 }}>
    {shares.map((share, index) => (
      <span
        key={index}
        className="lx-tick block flex-1 rounded-[2px]"
        style={{ height: `${Math.max(30, share * 100)}%`, background: WEEK_HUES[index % WEEK_HUES.length], boxShadow: `0 0 8px 1px ${WEEK_HUES[index % WEEK_HUES.length]}`, animationDelay: `${index * 0.35}s` }}
      />
    ))}
  </span>
);

/** A plate: the week number on a small lacquer rectangle. */
export const Plate = ({ size = 30, week = 37 }: { size?: number; week?: number }): ReactElement => (
  <span className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size, borderRadius: size * 0.22, background: LACQUER, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.28)' }}>
    <Aurora intensity={0.55} blur={size * 0.3} />
    <span className="relative font-mono font-bold text-white" style={{ fontSize: size * 0.34, letterSpacing: '-0.02em' }}>
      {week}
    </span>
  </span>
);

/* -------------------------------------------------------------------------- */
/* The objects                                                                 */
/* -------------------------------------------------------------------------- */

/** 1 · The orb in the header. Hover, and one line appears. */
export const OrbEntry = ({ onOpen, label = 'Your week 37' }: Entry & { label?: string }): ReactElement => {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="flex items-center gap-2 rounded-[999px] py-1 pl-1 pr-1" style={{ background: hover ? 'var(--theme-surface-float)' : 'transparent', transition: 'background .2s' }}>
      <Orb size={30} />
      <span className="overflow-hidden whitespace-nowrap text-text-primary typo-footnote" style={{ maxWidth: hover ? 140 : 0, opacity: hover ? 1 : 0, transition: 'max-width .3s cubic-bezier(.2,.8,.2,1), opacity .2s', paddingRight: hover ? 8 : 0 }}>
        {label}
      </span>
    </button>
  );
};

/** 2 · The plaque: a small lacquer tile, right-aligned above the feed. */
export const Plaque = ({ onOpen, mark = 'orb', line = 'Your week 37', sub = '5 highlights', width = 232 }: Entry & { mark?: 'orb' | 'rings' | 'grid' | 'stack' | 'seal' | 'aperture'; line?: string; sub?: string; width?: number }): ReactElement => {
  const marks = { orb: <Orb size={30} />, rings: <Rings size={26} />, grid: <LitGrid size={26} />, stack: <Stack size={30} />, seal: <Seal size={32} />, aperture: <Aperture size={30} /> };
  return (
    <Lacquer onClick={onOpen} className="flex items-center gap-3 py-2 pl-2.5 pr-3.5" style={{ width }} sheen>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-10" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
        {mark !== 'orb' && <Aurora intensity={0.35} blur={16} />}
        <span className="relative">{marks[mark]}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate font-bold typo-footnote">{line}</span>
        <Label dim>{sub}</Label>
      </span>
      <span className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent" style={{ borderLeftColor: 'rgba(255,255,255,.7)' }} />
    </Lacquer>
  );
};

/** 3 · The tile: square, the mark alone, one word under it. */
export const Tile = ({ onOpen, mark = 'rings', word = 'Highlights', size = 84 }: Entry & { mark?: 'rings' | 'grid' | 'aperture' | 'stack'; word?: string; size?: number }): ReactElement => {
  const marks = { rings: <Rings size={size * 0.34} />, grid: <LitGrid size={size * 0.34} />, aperture: <Aperture size={size * 0.38} />, stack: <Stack size={size * 0.38} /> };
  return (
    <Lacquer onClick={onOpen} className="flex flex-col items-center justify-center gap-2" style={{ width: size, height: size }} radius={size * 0.2}>
      <Aurora intensity={0.28} blur={22} />
      <span className="relative">{marks[mark]}</span>
      <span className="relative">
        <Label>{word}</Label>
      </span>
    </Lacquer>
  );
};

/** 4 · The seal in the tabs row. */
export const SealEntry = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex items-center gap-2 rounded-[999px] py-0.5 pl-0.5 pr-3" style={{ background: LACQUER, boxShadow: EDGE }}>
    <Seal size={30} />
    <span className="font-bold text-white typo-caption1">Your week</span>
  </button>
);

/** 5 · The capsule on the feed's right edge. */
export const Capsule = ({ onOpen }: Entry): ReactElement => (
  <Lacquer onClick={onOpen} absolute className="right-4 top-24 flex flex-col items-center justify-between py-3" style={{ width: 34, height: 128 }} radius={17}>
    <Aurora intensity={0.7} blur={14} />
    <span className="relative">
      <Rings size={18} />
    </span>
    <span className="relative font-mono font-bold text-white" style={{ fontSize: 10, writingMode: 'vertical-rl', letterSpacing: '0.2em' }}>
      W37
    </span>
  </Lacquer>
);

/** 6 · The floating orb, bottom right, with a whisper of copy. */
export const FloatingOrb = ({ onOpen }: Entry): ReactElement => (
  <Lacquer onClick={onOpen} absolute className="bottom-5 right-5 flex items-center gap-3 py-1.5 pl-1.5 pr-4" radius={999}>
    <Orb size={34} />
    <span className="flex flex-col leading-tight">
      <span className="font-bold typo-footnote">Your week is in</span>
      <Label dim>5 highlights · 40s</Label>
    </span>
  </Lacquer>
);

/** 7 · The mark alone, in the header, 28px. The smallest possible door. */
export const MarkOnly = ({ onOpen, mark = 'grid' }: Entry & { mark?: 'grid' | 'orb' | 'aperture' }): ReactElement => (
  <button type="button" onClick={onOpen} className="flex h-9 w-9 items-center justify-center rounded-10 hover:bg-surface-float" title="Your week 37 · 5 highlights">
    {mark === 'grid' && (
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-8" style={{ background: LACQUER, boxShadow: EDGE }}>
        <LitGrid size={16} />
      </span>
    )}
    {mark === 'orb' && <Orb size={26} />}
    {mark === 'aperture' && <Aperture size={26} />}
  </button>
);

/** 8 · The wordless plaque: the mark and the number, nothing else. */
export const Wordless = ({ onOpen }: Entry): ReactElement => (
  <Lacquer onClick={onOpen} className="flex items-center gap-3 py-2 pl-2.5 pr-4" radius={999} sheen>
    <Aperture size={28} />
    <span className="font-mono font-bold text-white" style={{ fontSize: 13, letterSpacing: '0.08em' }}>
      W37
    </span>
    <span className="flex h-4 w-4 items-center [&_svg]:h-full [&_svg]:w-full" style={{ '--theme-text-primary': 'rgba(255,255,255,.7)' } as CSSProperties}>
      <LogoIcon />
    </span>
  </Lacquer>
);
