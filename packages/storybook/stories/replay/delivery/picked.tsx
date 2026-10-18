import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import { HERO } from './mocks';
import { MobileTop } from './layouts';
import { Post } from './product';
import { Aurora, CardBack, Fan, LACQUER, Lacquer, Ledger, Plate, WEEK_HUES } from './lux';

type Entry = { onOpen: () => void };

/* -------------------------------------------------------------------------- */
/* Mobile, saved: pull to reveal                                               */
/* -------------------------------------------------------------------------- */

const THRESHOLD = 110;
const MAX_PULL = 180;
const SLIVER = 44;

/**
 * The mobile pick, as it was liked: on Monday the feed hides the Replay above
 * its own top edge. A purple sliver shows under the header; pull the feed
 * down and the hero card rises with it; past the threshold the sliver says
 * release, and letting go opens the pop-up deck. Below the threshold the feed
 * springs back and the sliver stays for later. Drag with the mouse.
 */
export const PullToReplay = ({ onOpen, height = 640, frozen }: Entry & { height?: number; /** Renders the gesture held at this pull, for the states row. */ frozen?: number }): ReactElement => {
  const [livePull, setPull] = useState(0);
  const pull = frozen ?? livePull;
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const onDown = useCallback((event: ReactPointerEvent) => {
    if (frozen !== undefined) return;
    startY.current = event.clientY;
    setDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }, [frozen]);
  const onMove = useCallback(
    (event: ReactPointerEvent) => {
      if (startY.current === null || !dragging) return;
      setPull(Math.min(MAX_PULL, Math.max(0, event.clientY - startY.current) * 0.8));
    },
    [dragging],
  );
  const onUp = useCallback(() => {
    if (!dragging) return;
    startY.current = null;
    setDragging(false);
    if (pull >= THRESHOLD) onOpen();
    setPull(0);
  }, [dragging, pull, onOpen]);

  const past = pull >= THRESHOLD;
  const progress = Math.min(1, pull / MAX_PULL);

  return (
    <div className="relative w-full select-none overflow-hidden rounded-[1.75rem] bg-background-default" style={{ height }}>
      <FrameStyles />
      <MobileTop />
      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: 97, height: SLIVER + pull, background: 'linear-gradient(180deg, #1A0A26, #2A0B3D 55%, #5A1E75)', transition: dragging ? 'none' : 'height .38s cubic-bezier(.2,.8,.2,1)' }}
      >
        <span className="absolute left-1/2 top-2.5 z-10 -translate-x-1/2 whitespace-nowrap rounded-[999px] px-3 py-1 font-mono uppercase tracking-[0.16em] text-white typo-caption2" style={{ background: past ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.3)', fontSize: 10, transition: 'background .2s' }}>
          {past ? '↑ release to open your Replay' : pull > 0 ? '↓ keep pulling' : '↓ week 37 is in'}
        </span>
        {pull > 12 && (
          <div className="absolute left-1/2" style={{ top: 46, transform: `translateX(-50%) scale(${0.6 + progress * 0.4})`, transformOrigin: 'top center', opacity: Math.min(1, pull / 50), transition: dragging ? 'none' : 'transform .38s cubic-bezier(.2,.8,.2,1), opacity .2s', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,.45))' }}>
            <FrameThumb width={150} candidate={HERO} data={sampleData[HERO.id]} />
          </div>
        )}
      </div>
      <div
        role="presentation"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-background-default p-3"
        style={{ top: 97 + SLIVER + pull, borderRadius: '1.25rem 1.25rem 0 0', boxShadow: '0 -8px 24px -12px rgba(0,0,0,.5)', transition: dragging ? 'none' : 'top .38s cubic-bezier(.2,.8,.2,1)', cursor: 'grab', touchAction: 'none' }}
      >
        <span className="mx-auto -mb-1 h-1 w-10 rounded-[999px] bg-border-subtlest-secondary" />
        <Post index={0} />
        <Post index={1} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop, again: rectangles, integrated, lit                                 */
/* -------------------------------------------------------------------------- */

const Line = ({ children, dim = false, size = 10 }: { children: ReactNode; dim?: boolean; size?: number }): ReactElement => (
  <span className="whitespace-nowrap font-mono uppercase tracking-[0.18em]" style={{ color: dim ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.9)', fontSize: size }}>
    {children}
  </span>
);

const Arrow = (): ReactElement => <span className="h-0 w-0 shrink-0 border-y-[4px] border-l-[6px] border-y-transparent" style={{ borderLeftColor: 'rgba(255,255,255,.7)' }} />;

export type RectMark = 'card' | 'fan' | 'ledger' | 'plate';

const markNode = (mark: RectMark, scale = 1): ReactElement => {
  if (mark === 'card') return <CardBack width={22 * scale} />;
  if (mark === 'fan') return <Fan width={16 * scale} />;
  if (mark === 'ledger') return <Ledger size={26 * scale} />;
  return <Plate size={30 * scale} />;
};

/** 1 · The plaque, squared: the same 248 × 52, a card's back where the seal was. */
export const RectPlaque = ({ onOpen, mark = 'card', glint = 'bright', width = 248 }: Entry & { mark?: RectMark; glint?: 'sweep' | 'bright' | 'edge'; width?: number }): ReactElement => (
  <Lacquer onClick={onOpen} className="flex items-center gap-3 py-2 pl-2.5 pr-3.5" style={{ width, height: 52 }} radius={12} glint={glint}>
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-8" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
      {mark !== 'card' && <Aurora intensity={0.35} blur={16} />}
      <span className="relative">{markNode(mark)}</span>
    </span>
    <span className="flex min-w-0 flex-1 flex-col leading-tight">
      <span className="truncate font-bold typo-footnote">Your week 37</span>
      <Line dim>5 highlights · 40s</Line>
    </span>
    <Arrow />
  </Lacquer>
);

/** 2 · The band: the full width of the feed, one row tall, the sheen crossing all of it. */
export const Band = ({ onOpen, mark = 'fan' }: Entry & { mark?: RectMark }): ReactElement => (
  <Lacquer onClick={onOpen} className="flex w-full items-center gap-4 py-2 pl-3 pr-4" style={{ height: 52 }} radius={14} glint="bright">
    <Aurora intensity={0.22} blur={40} />
    <span className="relative flex h-9 w-11 shrink-0 items-center justify-center">{markNode(mark)}</span>
    <span className="relative flex min-w-0 flex-col leading-tight">
      <span className="truncate font-bold typo-footnote">Your week 37 is in</span>
      <Line dim>5 highlights about you and where you stand</Line>
    </span>
    <span className="relative ml-auto flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((tick) => (
        <span key={tick} className="block h-3.5 w-2.5 rounded-[2px]" style={{ background: 'rgba(255,255,255,.1)', boxShadow: `inset 0 0 0 1px ${WEEK_HUES[tick % WEEK_HUES.length]}66` }} />
      ))}
    </span>
    <span className="relative flex items-center gap-2">
      <Line>40 seconds</Line>
      <Arrow />
    </span>
  </Lacquer>
);

/** 3 · The slot: the first cell of the grid, the size of a post. A door standing where a card would. */
export const SlotTile = ({ onOpen }: Entry): ReactElement => (
  <Lacquer onClick={onOpen} className="flex h-full min-h-[21rem] w-full flex-col items-center justify-center gap-5 p-5" radius={16} glint="bright">
    <Aurora intensity={0.28} blur={44} />
    <span className="relative">
      <Fan width={40} />
    </span>
    <span className="relative flex flex-col items-center gap-1 leading-tight">
      <span className="font-bold typo-title3">Your week 37</span>
      <Line dim size={11}>5 highlights · 40 seconds</Line>
    </span>
    <span className="relative mt-1 flex h-10 items-center rounded-12 bg-white px-4 font-bold typo-callout" style={{ color: LACQUER }}>
      Open
    </span>
    <span className="absolute left-4 top-4 flex h-4 w-4 items-center [&_svg]:h-full [&_svg]:w-full" style={{ '--theme-text-primary': 'rgba(255,255,255,.6)' } as CSSProperties}>
      <LogoIcon />
    </span>
  </Lacquer>
);

/** 4 · The plate in the header row: beside the feed's own name, 36px, the week's number lit. */
export const HeaderPlate = ({ onOpen, mark = 'plate' }: Entry & { mark?: RectMark }): ReactElement => (
  <Lacquer onClick={onOpen} className="flex items-center gap-2 py-1 pl-1 pr-3" style={{ height: 36 }} radius={10} glint="bright">
    <span className="relative flex h-7 w-7 items-center justify-center">{markNode(mark, 0.9)}</span>
    <span className="flex flex-col leading-none">
      <span className="font-bold typo-caption1">Your week</span>
      <Line dim size={9}>5 highlights</Line>
    </span>
    <Arrow />
  </Lacquer>
);

/** 5 · The column: exactly one grid column wide, on the first card's edge. Part of the grid, not over it. */
export const ColumnTile = ({ onOpen, mark = 'ledger' }: Entry & { mark?: RectMark }): ReactElement => (
  <Lacquer onClick={onOpen} className="flex w-full items-center gap-3 py-2 pl-3 pr-3.5" style={{ height: 56 }} radius={16} glint="bright">
    <Aurora intensity={0.25} blur={30} />
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-8" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)', background: 'rgba(0,0,0,.35)' }}>
      {markNode(mark, 1.05)}
    </span>
    <span className="relative flex min-w-0 flex-1 flex-col leading-tight">
      <span className="truncate font-bold typo-footnote">Your week 37</span>
      <Line dim>5 highlights · 40s</Line>
    </span>
    <span className="relative">
      <Arrow />
    </span>
  </Lacquer>
);

/** The plaque with each of the three ways of asking for attention, side by side. */
export const GlintRow = ({ onOpen }: Entry): ReactElement => (
  <div className="flex flex-wrap items-start gap-8">
    {(['sweep', 'bright', 'edge'] as const).map((glint) => (
      <div key={glint} className="flex flex-col gap-2">
        <RectPlaque onOpen={onOpen} glint={glint} />
        <span className={classNames('font-mono text-text-quaternary typo-caption2')}>
          {glint === 'sweep' && 'sweep · every 6s, 18% white'}
          {glint === 'bright' && 'bright · every 3.4s, 38% white'}
          {glint === 'edge' && 'edge · breathing glow in the week hues'}
        </span>
      </div>
    ))}
  </div>
);

/** The four rectangular marks, at plaque size. */
export const MarkRow = (): ReactElement => (
  <div className="flex flex-wrap items-end gap-8">
    {(['card', 'fan', 'ledger', 'plate'] as RectMark[]).map((mark) => (
      <div key={mark} className="flex flex-col items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-12" style={{ background: '#0B0B0F', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)' }}>
          {markNode(mark, 1.4)}
        </span>
        <span className="font-mono text-text-quaternary typo-caption2">{mark}</span>
      </div>
    ))}
  </div>
);
