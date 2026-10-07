import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { RarityTier, rarityRamp } from '../assets';
import { byId } from '../catalog';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import { Avatar, ME } from '../people';
import { HERO_CLAIM } from './mocks';
import { Post } from './product';

export const DECK = ['rank.topicReader', 'persona.week', 'achievement.unlocked', 'reading.grid', 'posts.top'];
/** The card the pack calls rare. Its rarity tier colours the foil. */
export const RARE = 'achievement.unlocked';

const WHITE_MARK = { '--theme-text-primary': '#FFFFFF' } as CSSProperties;

export const PackStyles = (): ReactElement => (
  <style>{`
@keyframes pkHolo { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes pkTear { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 55% { transform: translate(14px,-30px) rotate(-10deg); opacity: 1; } 100% { transform: translate(34px,-70px) rotate(-22deg); opacity: 0; } }
@keyframes pkSink { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(26px) scale(.94); opacity: 0; } }
@keyframes pkDeal { 0% { transform: translateY(-18px) rotateY(0) scale(.92); opacity: 0; } 100% { transform: translateY(0) rotateY(0) scale(1); opacity: 1; } }
@keyframes pkGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(87,224,135,.0), 0 18px 40px -18px rgba(87,224,135,.5); } 50% { box-shadow: 0 0 0 4px rgba(87,224,135,.25), 0 18px 40px -12px rgba(87,224,135,.75); } }
@keyframes pkBreathe { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-5px) rotate(-1deg); } }
.pk-holo::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,.28) 38%, rgba(206,61,243,.28) 46%, rgba(41,216,229,.24) 54%, rgba(255,226,76,.22) 62%, transparent 80%);
  background-size: 220% 100%; animation: pkHolo 4.5s linear infinite; mix-blend-mode: screen;
}
.pk-tear { animation: pkTear .5s cubic-bezier(.2,.8,.2,1) forwards; }
.pk-sink { animation: pkSink .45s .3s ease-in forwards; }
.pk-deal { animation: pkDeal .55s cubic-bezier(.2,.9,.25,1.05) both; }
.pk-glow { animation: pkGlow 2.2s ease-in-out infinite; }
.pk-breathe { animation: pkBreathe 3s ease-in-out infinite; }
.pk-flip { perspective: 1200px; }
.pk-flip-inner { position: relative; transform-style: preserve-3d; transition: transform .65s cubic-bezier(.2,.8,.2,1); }
.pk-flip-inner.is-flipped { transform: rotateY(180deg); }
.pk-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.pk-face.is-front { position: absolute; inset: 0; transform: rotateY(180deg); }
.pk-back-pattern {
  background-image:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,.10) 0 1px, transparent 1.5px),
    linear-gradient(135deg, rgba(255,255,255,.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.06) 75%, transparent 75%);
  background-size: 14px 14px, 22px 22px;
}
@media (prefers-reduced-motion: reduce) { .pk-holo::after, .pk-glow, .pk-breathe { animation: none; } .pk-flip-inner { transition: none; } }
  `}</style>
);

const foilFor = (tier: RarityTier | null): string => {
  if (!tier) return 'linear-gradient(160deg, #1A0A26 0%, #2A0B3D 45%, #3B1454 100%)';
  const [a, b] = rarityRamp[tier];
  return `linear-gradient(160deg, #1A0A26 0%, #2A0B3D 38%, ${a}66 72%, ${b}99 100%)`;
};

const tierName: Record<RarityTier, string> = {
  [RarityTier.Emerald]: 'Emerald',
  [RarityTier.Gold]: 'Gold',
  [RarityTier.Silver]: 'Silver',
  [RarityTier.Bronze]: 'Bronze',
};

/* -------------------------------------------------------------------------- */
/* The pack                                                                    */
/* -------------------------------------------------------------------------- */

export type PackSize = 'slot' | 'mini' | 'icon';

const packDims: Record<PackSize, { w: number; h: number; r: number }> = {
  slot: { w: 176, h: 248, r: 16 },
  mini: { w: 44, h: 62, r: 6 },
  icon: { w: 18, h: 26, r: 3 },
};

/**
 * The sealed pack. The foil takes the colour of the rarest card inside, so
 * the pack says something about the week before it is opened; the tear strip
 * is the only affordance and it says what it does.
 */
export const FoilPack = ({
  size = 'slot',
  tier = RarityTier.Emerald,
  week = 37,
  tearing = false,
  onTear,
  breathe = false,
  className,
}: {
  size?: PackSize;
  tier?: RarityTier | null;
  week?: number;
  tearing?: boolean;
  onTear?: () => void;
  breathe?: boolean;
  className?: string;
}): ReactElement => {
  const { w, h, r } = packDims[size];
  const holo = tier === RarityTier.Emerald || tier === RarityTier.Gold;
  const Tag = onTear ? 'button' : 'div';
  return (
    <Tag
      type={onTear ? 'button' : undefined}
      onClick={onTear}
      className={classNames('relative flex shrink-0 flex-col items-center justify-between overflow-hidden text-white', holo && size === 'slot' && 'pk-holo', breathe && 'pk-breathe', className)}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: foilFor(tier),
        boxShadow: size === 'slot' ? '0 26px 44px -22px rgba(42,11,61,.75), inset 0 0 0 1px rgba(255,255,255,.2), inset 0 1px 0 rgba(255,255,255,.25)' : 'inset 0 0 0 1px rgba(255,255,255,.22)',
        padding: size === 'slot' ? 12 : 0,
      }}
    >
      {size === 'slot' && (
        <>
          <span
            className={classNames('absolute inset-x-0 top-0 flex h-9 items-center justify-center border-b border-dashed border-white/45', tearing && 'pk-tear')}
            style={{ background: 'rgba(255,255,255,.12)' }}
          >
            <span className="font-mono uppercase tracking-[0.2em] typo-caption2">tear here</span>
          </span>
          <span className={classNames('relative mt-12 flex flex-col items-center gap-2', tearing && 'pk-sink')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-12 bg-black/25 [&_svg]:h-6 [&_svg]:w-6" style={WHITE_MARK}>
              <LogoIcon />
            </span>
            <span className="font-bold typo-title3">Week {week}</span>
            <span className="font-mono uppercase tracking-[0.16em] text-white/80 typo-caption2">5 cards</span>
            {tier && (
              <span className="rounded-[999px] px-2 py-0.5 font-mono uppercase tracking-[0.14em] typo-caption2" style={{ background: 'rgba(0,0,0,.5)', color: rarityRamp[tier][1] }}>
                1 {tierName[tier]}
              </span>
            )}
          </span>
          <span className={classNames('relative flex items-center gap-1.5 text-white/85 typo-caption2', tearing && 'pk-sink')}>
            <Avatar person={ME} size={16} />
            @mayabuilds
          </span>
        </>
      )}
      {size === 'mini' && (
        <>
          <span className="absolute inset-x-0 top-0 h-2 border-b border-dashed border-white/40" style={{ background: 'rgba(255,255,255,.12)' }} />
          <span className="mt-3 flex h-4 w-4 [&_svg]:h-full [&_svg]:w-full" style={WHITE_MARK}>
            <LogoIcon />
          </span>
          <span className="mb-1 font-mono typo-caption2">W{week}</span>
        </>
      )}
      {size === 'icon' && <span className="absolute inset-x-0 top-0 h-1 border-b border-dashed border-white/40" style={{ background: 'rgba(255,255,255,.14)' }} />}
    </Tag>
  );
};

/* -------------------------------------------------------------------------- */
/* Card backs and the flip                                                     */
/* -------------------------------------------------------------------------- */

export const CardBack = ({ width, index, week = 37, rare = false }: { width: number; index: number; week?: number; rare?: boolean }): ReactElement => (
  <div
    className={classNames('pk-back-pattern relative flex flex-col items-center justify-between overflow-hidden text-white', rare && 'pk-holo')}
    style={{
      width,
      height: (width * 16) / 9,
      borderRadius: width * 0.09,
      padding: width * 0.08,
      background: rare
        ? 'linear-gradient(160deg, #0F2A1A 0%, #1A0A26 40%, #2A0B3D 100%)'
        : 'linear-gradient(160deg, #1A0A26 0%, #2A0B3D 55%, #3B1454 100%)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18), 0 14px 30px -18px rgba(0,0,0,.6)',
    }}
  >
    <span className="self-start rounded-[999px] px-1.5 py-0.5 font-mono typo-caption2" style={{ background: 'rgba(0,0,0,.3)' }}>
      {index + 1} / 5
    </span>
    <span className="flex items-center justify-center rounded-16 [&_svg]:h-full [&_svg]:w-full" style={{ ...WHITE_MARK, width: width * 0.36, height: width * 0.36, background: 'rgba(0,0,0,.22)', padding: width * 0.08 }}>
      <LogoIcon />
    </span>
    <span className="font-mono uppercase tracking-[0.16em] text-white/70 typo-caption2">W{week} · tap to flip</span>
  </div>
);

export const FlipCard = ({
  id,
  index,
  width = 120,
  flipped,
  onFlip,
  rare = false,
  delay = 0,
}: {
  id: string;
  index: number;
  width?: number;
  flipped: boolean;
  onFlip?: () => void;
  rare?: boolean;
  delay?: number;
}): ReactElement => (
  <button type="button" onClick={onFlip} className="pk-flip pk-deal block shrink-0" style={{ width, height: (width * 16) / 9, animationDelay: `${delay}ms` }}>
    <div className={classNames('pk-flip-inner h-full w-full', flipped && 'is-flipped')}>
      <div className="pk-face">
        <CardBack width={width} index={index} rare={rare} />
      </div>
      <div className={classNames('pk-face is-front overflow-hidden', rare && flipped && 'pk-glow')} style={{ borderRadius: width * 0.09 }}>
        <FrameThumb width={width} candidate={byId(id)} data={sampleData[id]} />
      </div>
    </div>
  </button>
);

/* -------------------------------------------------------------------------- */
/* The band the pack opens into                                                */
/* -------------------------------------------------------------------------- */

export const PackBand = ({
  flipped,
  onFlip,
  onFlipAll,
  compact = false,
}: {
  flipped: boolean[];
  onFlip: (index: number) => void;
  onFlipAll?: () => void;
  compact?: boolean;
}): ReactElement => {
  const revealed = flipped.filter(Boolean).length;
  const done = revealed === DECK.length;
  return (
    <div
      className="relative flex items-center gap-6 overflow-hidden rounded-16 border border-border-subtlest-tertiary p-5"
      style={{ background: 'radial-gradient(60% 160% at 0% 50%, rgba(206,61,243,.16) 0%, transparent 60%), var(--theme-surface-float)' }}
    >
      <PackStyles />
      <FrameStyles />
      <div className="flex w-[15rem] shrink-0 flex-col gap-2">
        <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
          <FoilPack size="icon" tier={RarityTier.Emerald} />
          Week 37 · {done ? 'all five' : `${revealed} of 5 revealed`}
        </span>
        <span className="text-text-primary typo-title3">{done ? 'That was your week.' : flipped[0] ? HERO_CLAIM : 'Flip them one by one.'}</span>
        <span className="text-text-tertiary typo-footnote">
          {done ? 'Post the pack, or the one card you liked most.' : 'One of them is rarer than the others. The foil knew.'}
        </span>
        <span className="mt-1 flex flex-wrap gap-2">
          {done ? (
            <>
              <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">Post the pack</span>
              <span className="rounded-10 border border-border-subtlest-secondary px-3 py-1.5 font-bold text-text-primary typo-caption1">Copy best card</span>
            </>
          ) : (
            <button type="button" onClick={onFlipAll} className="rounded-10 border border-border-subtlest-secondary px-3 py-1.5 font-bold text-text-primary typo-caption1">
              Flip all
            </button>
          )}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {DECK.map((id, index) => (
          <FlipCard key={id} id={id} index={index} width={compact ? 100 : 118} flipped={flipped[index]} onFlip={() => onFlip(index)} rare={id === RARE} delay={index * 70} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* The strip                                                                   */
/* -------------------------------------------------------------------------- */

export type StripState = 'sealed' | 'partial' | 'done';

export const PackStrip = ({ state, revealed = 3 }: { state: StripState; revealed?: number }): ReactElement => {
  const copy: Record<StripState, { title: string; sub: string; cta: string }> = {
    sealed: { title: HERO_CLAIM, sub: 'Week 37 · sealed · 5 cards', cta: 'Tear it open' },
    partial: { title: `${revealed} of 5 flipped. Two still face down.`, sub: 'Week 37', cta: 'Keep flipping' },
    done: { title: 'Week 37, all five seen.', sub: 'Post the pack while it is fresh', cta: 'Post the pack' },
  };
  const c = copy[state];
  return (
    <div className="flex w-full items-center gap-3 rounded-12 px-3 py-2 text-white" style={{ background: 'linear-gradient(90deg, #2A0B3D 0%, #5A1E75 70%, #7A2A9C 100%)' }}>
      <PackStyles />
      <FoilPack size="mini" tier={state === 'sealed' ? RarityTier.Emerald : null} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-footnote">{c.title}</span>
        <span className="truncate text-white/65 typo-caption2">{c.sub}</span>
      </span>
      {state === 'partial' && (
        <span className="flex items-center gap-1">
          {DECK.map((id, i) => (
            <span key={id} className={classNames('h-1.5 w-3 rounded-[999px]', i < revealed ? 'bg-white' : 'bg-white/30')} />
          ))}
        </span>
      )}
      <span className="rounded-8 bg-white px-2.5 py-1 font-bold text-[#2A0B3D] typo-caption1">{c.cta}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* The share unit and the binder                                               */
/* -------------------------------------------------------------------------- */

export const PackShare = ({ width = 340 }: { width?: number }): ReactElement => (
  <div
    className="relative flex flex-col items-center justify-between overflow-hidden text-white"
    style={{ width, height: width * 1.25, borderRadius: width * 0.06, background: 'radial-gradient(90% 60% at 50% 0%, rgba(206,61,243,.45) 0%, transparent 60%), linear-gradient(180deg, #1A0A26 0%, #0F0F12 100%)', padding: width * 0.06 }}
  >
    <FrameStyles />
    <span className="flex w-full items-center justify-between">
      <span className="flex items-center gap-2 typo-footnote">
        <Avatar person={ME} size={22} />
        @mayabuilds · week 37
      </span>
      <span className="flex h-5 [&_svg]:h-full [&_svg]:w-auto" style={WHITE_MARK}>
        <LogoIcon />
      </span>
    </span>
    <div className="relative w-full" style={{ height: width * 0.56 }}>
      {DECK.map((id, index) => (
        <div
          key={id}
          className="absolute left-1/2 top-2 origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${(index - 2) * 8}deg) translateX(${(index - 2) * (width * 0.13)}px)`, zIndex: index === 0 ? 10 : 5 - Math.abs(index - 2) }}
        >
          <FrameThumb width={index === 0 ? width * 0.24 : width * 0.21} candidate={byId(id)} data={sampleData[id]} />
        </div>
      ))}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(180deg, transparent, #0F0F12)' }} />
    </div>
    <div className="relative flex flex-col items-center gap-1 text-center">
      <span className="font-bold typo-title3">{HERO_CLAIM}</span>
      <span className="text-white/65 typo-caption1">Five cards. One Emerald. My week on daily.dev.</span>
    </div>
  </div>
);

export const Binder = (): ReactElement => {
  const weeks = [
    { w: 37, id: 'rank.topicReader', tier: RarityTier.Emerald },
    { w: 36, id: 'trend.early', tier: RarityTier.Gold },
    { w: 35, id: 'persona.week', tier: RarityTier.Silver },
    { w: 34, id: 'streak.moment', tier: RarityTier.Silver },
    { w: 33, id: 'source.obscurity', tier: RarityTier.Bronze },
    { w: 32, id: 'tags.shift', tier: RarityTier.Bronze },
  ];
  return (
    <div className="flex w-[40rem] max-w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
      <PackStyles />
      <FrameStyles />
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2">Profile · Replay</span>
          <span className="text-text-primary typo-title3">Your binder</span>
          <span className="text-text-tertiary typo-footnote">Every week you opened, kept. Six weeks, two Gold, one Emerald.</span>
        </div>
        <span className="flex items-center gap-2 text-text-tertiary typo-caption1">
          <FoilPack size="mini" tier={null} week={38} />
          Week 38 seals Sunday
        </span>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {weeks.map(({ w, id, tier }) => (
          <div key={w} className="flex flex-col items-center gap-1.5">
            <div className={classNames('overflow-hidden rounded-10', tier === RarityTier.Emerald && 'pk-glow')} style={{ boxShadow: `0 0 0 2px ${rarityRamp[tier][0]}` }}>
              <FrameThumb width={88} candidate={byId(id)} data={sampleData[id]} />
            </div>
            <span className="font-mono text-text-tertiary typo-caption2">W{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile: pull to tear                                                        */
/* -------------------------------------------------------------------------- */

const THRESHOLD = 120;
const MAX_PULL = 190;

/**
 * Drag the feed down. The pack sits behind its top edge; past the threshold
 * the strip reads "release to tear", and letting go opens the pack in place.
 * Pointer events only, no library, so the story can be operated with a mouse.
 */
export const PullToTear = (): ReactElement => {
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'tearing' | 'open'>('idle');
  const [flipped, setFlipped] = useState<boolean[]>(DECK.map(() => false));
  const startY = useRef<number | null>(null);

  const onDown = useCallback((event: ReactPointerEvent) => {
    if (phase === 'open') return;
    startY.current = event.clientY;
    setPhase('dragging');
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }, [phase]);

  const onMove = useCallback((event: ReactPointerEvent) => {
    if (startY.current === null || phase !== 'dragging') return;
    const delta = Math.max(0, event.clientY - startY.current);
    setPull(Math.min(MAX_PULL, delta * 0.8));
  }, [phase]);

  const onUp = useCallback(() => {
    if (phase !== 'dragging') return;
    startY.current = null;
    if (pull >= THRESHOLD) {
      setPhase('tearing');
      setPull(MAX_PULL);
      window.setTimeout(() => setPhase('open'), 700);
    } else {
      setPhase('idle');
      setPull(0);
    }
  }, [phase, pull]);

  const reset = () => {
    setPhase('idle');
    setPull(0);
    setFlipped(DECK.map(() => false));
  };

  const past = pull >= THRESHOLD;

  return (
    <div className="relative h-[36rem] w-full select-none overflow-hidden rounded-[1.75rem] bg-background-default">
      <PackStyles />
      <FrameStyles />
      <div
        className="absolute inset-x-0 top-0 flex flex-col items-center justify-end gap-2 pb-3"
        style={{ height: phase === 'open' ? 0 : Math.max(52, pull + 52), background: 'linear-gradient(180deg, #1A0A26, #2A0B3D 60%, #5A1E75)', transition: phase === 'dragging' ? 'none' : 'height .35s cubic-bezier(.2,.8,.2,1)' }}
      >
        {pull > 24 ? (
          <div className="mb-1 flex flex-col items-center gap-2" style={{ transform: `scale(${0.5 + Math.min(1, pull / MAX_PULL) * 0.5})`, transformOrigin: 'bottom center', opacity: Math.min(1, pull / 80) }}>
            <FoilPack size="slot" tier={RarityTier.Emerald} tearing={phase === 'tearing'} />
          </div>
        ) : null}
        {phase !== 'open' && (
          <span className="rounded-[999px] bg-black/30 px-2.5 py-0.5 font-mono uppercase tracking-[0.16em] text-white typo-caption2">
            {phase === 'tearing' ? 'tearing…' : past ? '↑ release to tear' : pull > 0 ? '↓ keep pulling' : '↓ week 37 is in'}
          </span>
        )}
      </div>

      <div
        role="presentation"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-background-default p-3"
        style={{ top: phase === 'open' ? 0 : pull + 52, borderRadius: '1.25rem 1.25rem 0 0', transition: phase === 'dragging' ? 'none' : 'top .35s cubic-bezier(.2,.8,.2,1)', cursor: phase === 'open' ? 'default' : 'grab', touchAction: 'none' }}
      >
        {phase === 'open' ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
                <FoilPack size="icon" tier={RarityTier.Emerald} />
                Week 37 · {flipped.filter(Boolean).length} of 5
              </span>
              <button type="button" onClick={reset} className="text-text-quaternary typo-caption2 underline">
                reset
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DECK.map((id, index) => (
                <FlipCard key={id} id={id} index={index} width={104} flipped={flipped[index]} rare={id === RARE} delay={index * 70} onFlip={() => setFlipped((f) => f.map((v, i) => (i === index ? true : v)))} />
              ))}
            </div>
            <span className="px-1 text-text-primary typo-callout">{flipped[0] ? HERO_CLAIM : 'Tap a card to flip it.'}</span>
            <span className="flex gap-2 px-1">
              <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">Post the pack</span>
              <span className="rounded-10 border border-border-subtlest-secondary px-3 py-1.5 font-bold text-text-primary typo-caption1">Later</span>
            </span>
          </div>
        ) : (
          <span className="mx-auto -mb-1 h-1 w-10 rounded-[999px] bg-border-subtlest-secondary" />
        )}
        <Post index={0} />
        <Post index={1} />
      </div>
    </div>
  );
};

export const Note = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="text-text-tertiary typo-footnote">{children}</span>
);
