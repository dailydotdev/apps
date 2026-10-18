import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { charmArt, RarityTier } from '../assets';
import { byId } from '../catalog';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import { Avatar, CAST, ME } from '../people';
import { HERO } from './mocks';
import { CardBack, DECK, FoilPack } from './pack';

const WHITE_MARK = { '--theme-text-primary': '#FFFFFF' } as CSSProperties;
type Entry = { onOpen: () => void };

/**
 * Twelve more doors. None of them is a card in a slot, a strip, a banner or a
 * pill. Each one is either a physical object sitting on the feed, a piece of
 * the person's own data acting as the handle, or a moment the feed performs
 * once. Everything here opens the same pop-up.
 */
export const Entry2Styles = (): ReactElement => (
  <style>{`
@keyframes e2Peek { 0%, 100% { transform: translateX(62%) rotate(-8deg); } 50% { transform: translateX(58%) rotate(-7deg); } }
@keyframes e2Shuffle {
  0%, 18% { transform: translate(0, 0) rotate(0deg); z-index: 3; }
  30% { transform: translate(120px, -10px) rotate(14deg); z-index: 3; }
  42%, 100% { transform: translate(-10px, 12px) rotate(-6deg) scale(.94); z-index: 1; }
}
@keyframes e2Swing { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes e2Print { 0% { transform: translateY(-100%); } 100% { transform: translateY(0); } }
@keyframes e2Ribbon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
@keyframes e2Type { from { width: 0; } to { width: 100%; } }
@keyframes e2Caret { 50% { border-color: transparent; } }
@keyframes e2Seal { 0%, 100% { box-shadow: 0 0 0 0 rgba(206,61,243,.55); } 60% { box-shadow: 0 0 0 10px rgba(206,61,243,0); } }
@keyframes e2Walk { 0% { transform: translateX(160px); opacity: 0; } 30% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes e2Drop { 0%, 40% { transform: translateY(-14px) scale(.9); opacity: 0; } 60% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes e2Sky { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
.e2-peek { animation: e2Peek 3.4s ease-in-out infinite; transform-origin: bottom left; }
.e2-peek:hover { animation: none; transform: translateX(28%) rotate(-4deg); }
.e2-shuffle > * { animation: e2Shuffle 4.2s cubic-bezier(.2,.8,.2,1) infinite; }
.e2-shuffle > :nth-child(2) { animation-delay: -1.4s; }
.e2-shuffle > :nth-child(3) { animation-delay: -2.8s; }
.e2-swing { transform-origin: top center; animation: e2Swing 3.6s ease-in-out infinite; }
.e2-print { animation: e2Print 1.1s cubic-bezier(.2,.9,.2,1) both; }
.e2-ribbon { animation: e2Ribbon 2.6s ease-in-out infinite; }
.e2-type { display: inline-block; overflow: hidden; white-space: nowrap; border-right: 2px solid currentColor; animation: e2Type 2.4s steps(44) .3s both, e2Caret .8s step-end infinite; }
.e2-seal { animation: e2Seal 2.4s ease-out infinite; }
.e2-walk { animation: e2Walk 1.6s cubic-bezier(.2,.8,.2,1) both; }
.e2-drop { animation: e2Drop 1.9s cubic-bezier(.2,.8,.2,1) both; }
.e2-sky { background-size: 300% 100%; animation: e2Sky 18s linear infinite alternate; }
.e2-flip { perspective: 900px; }
.e2-flip-inner { position: relative; transform-style: preserve-3d; transition: transform .6s cubic-bezier(.2,.8,.2,1); }
.e2-flip-inner.is-up { transform: rotateY(180deg); }
.e2-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.e2-face.is-front { position: absolute; inset: 0; transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) { .e2-peek, .e2-shuffle > *, .e2-swing, .e2-ribbon, .e2-seal, .e2-sky { animation: none; } }
  `}</style>
);

/* 1 · A card tucked behind the edge of the screen. */
export const PeekingCard = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="e2-peek absolute bottom-10 right-0" title="Your week 37 is in">
    <FrameStyles />
    <div className="rounded-16" style={{ boxShadow: '-14px 18px 40px -14px rgba(42,11,61,.6)' }}>
      <FrameThumb width={150} candidate={HERO} data={sampleData[HERO.id]} />
    </div>
  </button>
);

/* 2 · A card face down on the desk. Flip it, then open. */
export const DeskCard = ({ onOpen }: Entry): ReactElement => {
  const [up, setUp] = useState(false);
  return (
    <div className="absolute bottom-5 left-5 flex items-end gap-3">
      <button type="button" onClick={() => (up ? onOpen() : setUp(true))} className="e2-flip block" style={{ width: 96, height: 170, transform: 'rotate(-6deg)' }}>
        <FrameStyles />
        <div className={classNames('e2-flip-inner h-full w-full', up && 'is-up')}>
          <div className="e2-face">
            <CardBack width={96} index={0} rare />
          </div>
          <div className="e2-face is-front overflow-hidden rounded-10">
            <FrameThumb width={96} candidate={HERO} data={sampleData[HERO.id]} />
          </div>
        </div>
      </button>
      <span className="mb-2 rounded-10 bg-background-default px-2.5 py-1.5 text-text-tertiary shadow-2 typo-caption1">
        {up ? 'Tap again for all five' : 'One landed on your desk. Flip it.'}
      </span>
    </div>
  );
};

/* 3 · A tiny deck that shuffles itself: the pop-up's own gesture, previewed. */
export const LiveMiniDeck = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="absolute bottom-6 right-6 flex items-end gap-3">
    <FrameStyles />
    <span className="mb-4 rounded-10 bg-text-primary px-2.5 py-1.5 text-left text-surface-invert shadow-3">
      <span className="block font-bold typo-footnote">Week 37 · 5 cards</span>
      <span className="block typo-caption2 opacity-70">Tap to deal them</span>
    </span>
    <span className="e2-shuffle relative block" style={{ width: 104, height: 168 }}>
      {DECK.slice(0, 3).map((id) => (
        <span key={id} className="absolute left-0 top-0 block overflow-hidden rounded-10" style={{ boxShadow: '0 14px 30px -14px rgba(0,0,0,.6)' }}>
          <FrameThumb width={88} candidate={byId(id)} data={sampleData[id]} />
        </span>
      ))}
    </span>
  </button>
);

/* 4 · A conference badge on a lanyard, with the archetype on it. */
export const LanyardBadge = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="absolute right-14 top-0 flex flex-col items-center">
    <span className="h-16 w-3 rounded-b-4" style={{ background: 'repeating-linear-gradient(180deg, #CE3DF3 0 6px, #2A0B3D 6px 12px)' }} />
    <span className="e2-swing -mt-1 flex w-[11.5rem] flex-col items-center gap-2 rounded-14 border border-border-subtlest-tertiary bg-background-default p-3 pt-4 shadow-3">
      <span className="absolute top-1.5 h-2 w-8 rounded-[999px] bg-border-subtlest-secondary" />
      <Avatar person={ME} size={44} />
      <span className="text-center font-bold text-text-primary typo-callout">Maya Chen</span>
      <span className="rounded-8 px-2 py-1 text-center font-mono uppercase tracking-[0.12em] text-white typo-caption2" style={{ background: 'linear-gradient(90deg, #5A1E75, #CE3DF3)' }}>
        Night Owl Infra Digger
      </span>
      <span className="text-text-quaternary typo-caption2">week 37 · tap for the rest</span>
      <span className="mt-1 flex h-5 items-center gap-1.5 text-text-primary [&_svg]:h-4 [&_svg]:w-4">
        <LogoIcon />
      </span>
    </span>
  </button>
);

/* 5 · A receipt prints out from under the header. */
export const ReceiptTicket = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="e2-print absolute left-1/2 top-14 -translate-x-1/2 overflow-hidden">
    <span
      className="block w-[16rem] px-4 pb-3 pt-3 text-left font-mono text-[11px] leading-[1.5]"
      style={{
        background: '#FBFBF7',
        color: '#1A1A1A',
        boxShadow: '0 18px 30px -16px rgba(0,0,0,.5)',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), 96% 100%, 92% calc(100% - 6px), 88% 100%, 84% calc(100% - 6px), 80% 100%, 76% calc(100% - 6px), 72% 100%, 68% calc(100% - 6px), 64% 100%, 60% calc(100% - 6px), 56% 100%, 52% calc(100% - 6px), 48% 100%, 44% calc(100% - 6px), 40% 100%, 36% calc(100% - 6px), 32% 100%, 28% calc(100% - 6px), 24% 100%, 20% calc(100% - 6px), 16% 100%, 12% calc(100% - 6px), 8% 100%, 4% calc(100% - 6px), 0 100%)',
      }}
    >
      <span className="block text-center font-bold tracking-[0.2em]">DAILY.DEV</span>
      <span className="block text-center">WEEK 37 · @MAYABUILDS</span>
      <span className="my-2 block border-t border-dashed border-black/30" />
      <span className="flex justify-between"><span>POSTS READ</span><span>47</span></span>
      <span className="flex justify-between"><span>K8S RANK</span><span>TOP 2%</span></span>
      <span className="flex justify-between"><span>ARCHETYPE</span><span>NIGHT OWL</span></span>
      <span className="flex justify-between"><span>RARE PULL</span><span>EMERALD</span></span>
      <span className="my-2 block border-t border-dashed border-black/30" />
      <span className="flex justify-between font-bold"><span>CARDS</span><span>5</span></span>
      <span className="mt-2 block text-center">▸ TEAR HERE TO OPEN ◂</span>
    </span>
  </button>
);

/* 6 · A ribbon hanging from the top edge, like a bookmark in a book. */
export const BookmarkRibbon = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="e2-ribbon absolute left-[42%] top-0 flex flex-col items-center">
    <span
      className="flex h-28 w-11 flex-col items-center justify-end gap-1 pb-3 text-white"
      style={{ background: 'linear-gradient(180deg, #5A1E75, #CE3DF3)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)', boxShadow: '0 12px 20px -10px rgba(206,61,243,.7)' }}
    >
      <span className="flex h-4 w-4 [&_svg]:h-full [&_svg]:w-full" style={WHITE_MARK}>
        <LogoIcon />
      </span>
      <span className="font-mono typo-caption2">W37</span>
    </span>
  </button>
);

/* 7 · The standing counts up in the header, then rests as a chip. */
export const OdometerChip = ({ onOpen }: Entry): ReactElement => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1600);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(eased * 98));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const settled = value >= 98;
  return (
    <button type="button" onClick={onOpen} className={classNames('flex items-center gap-2 rounded-10 border px-2.5 py-1 text-left', settled ? 'border-accent-cabbage-default bg-overlay-float-cabbage' : 'border-border-subtlest-tertiary bg-surface-float')}>
      <span className="font-bold text-text-primary typo-callout" style={{ fontVariantNumeric: 'tabular-nums', minWidth: '4.6ch' }}>
        Top {100 - value}%
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-text-tertiary typo-caption2">Kubernetes readers</span>
        <span className="text-text-quaternary typo-caption2">{settled ? 'week 37 sealed · open' : 'week 37 sealing…'}</span>
      </span>
    </button>
  );
};

/* 8 · Your week's grid where your avatar was. */
const GRID = sampleData['reading.grid']?.matrix;
export const GridAvatar = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="e2-seal relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-10" style={{ background: '#0F0F12' }} title="Your week 37, as a grid. Tap to open.">
    <span className="grid gap-[1.5px]" style={{ gridTemplateColumns: `repeat(${GRID?.cols ?? 7}, 1fr)`, width: 28 }}>
      {(GRID?.cells ?? []).slice(0, 35).map((cell, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={index} className="aspect-square rounded-[1px]" style={{ background: GRID?.palette[cell] ?? '#333' }} />
      ))}
    </span>
    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-[999px] border-2 border-background-default bg-accent-cabbage-default" />
  </button>
);

/* 9 · A line that types itself out, once, under the header. */
export const TypedTicker = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 rounded-10 px-3 py-2 text-left font-mono uppercase tracking-[0.14em] text-text-primary typo-caption1" style={{ background: 'var(--theme-surface-float)' }}>
    <span className="h-2 w-2 shrink-0 rounded-[999px] bg-accent-cabbage-default" />
    <span className="e2-type">week 37 · top 2% of kubernetes readers · 5 cards ▶</span>
  </button>
);

/* 10 · The sky above the feed takes the colours of your week. */
export const SkyStrip = ({ onOpen }: Entry): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="e2-sky relative flex h-12 w-full items-center justify-between overflow-hidden rounded-12 px-4 text-left text-white"
    style={{ background: 'linear-gradient(90deg, #2A0B3D, #4A7EEE, #29D8E5, #57E087, #FFE24C, #FF9157, #CE3DF3, #2A0B3D)' }}
  >
    <span className="font-mono uppercase tracking-[0.16em] typo-caption2" style={{ textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>
      Your week, in its colours
    </span>
    <span className="flex items-center gap-2 typo-footnote" style={{ textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>
      Kubernetes · Rust · Postgres · Go · AI
      <span className="flex h-6 w-6 items-center justify-center rounded-[999px] bg-white/25">
        <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
      </span>
    </span>
  </button>
);

/* 11 · Sunday night: a countdown; Monday: sealed. The same chip, two days. */
export const CountdownChip = ({ onOpen, sealed = false }: Entry & { sealed?: boolean }): ReactElement => (
  <button type="button" onClick={onOpen} className={classNames('absolute bottom-5 right-5 flex items-center gap-3 rounded-[999px] py-1.5 pl-1.5 pr-4 text-left text-white shadow-3', sealed && 'e2-seal')} style={{ background: 'linear-gradient(90deg, #1A0A26, #2A0B3D)' }}>
    <span className="flex h-9 w-9 items-center justify-center rounded-[999px]" style={{ background: 'rgba(255,255,255,.08)' }}>
      {sealed ? <FoilPack size="mini" tier={RarityTier.Emerald} className="scale-[.62]" /> : <span className="font-mono typo-caption1">2h</span>}
    </span>
    <span className="flex flex-col leading-tight">
      <span className="font-bold typo-footnote">{sealed ? 'Week 37 sealed' : 'Week 37 seals in 2h 14m'}</span>
      <span className="typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>{sealed ? 'Top 2% of Kubernetes readers · open' : 'You are top 3% in Kubernetes right now'}</span>
    </span>
  </button>
);

/* 12 · Three people you follow already opened theirs. */
export const SocialPill = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-[999px] border border-border-subtlest-tertiary bg-background-default py-1.5 pl-2 pr-4 shadow-3">
    <span className="flex -space-x-2">
      {CAST.slice(0, 3).map((person) => (
        <Avatar key={person.login} person={person} size={26} ring="var(--theme-background-default)" />
      ))}
    </span>
    <span className="flex flex-col text-left leading-tight">
      <span className="font-bold text-text-primary typo-footnote">Kelsey, Sindre and Lydia opened theirs</span>
      <span className="text-text-tertiary typo-caption2">Your week 37 is in too</span>
    </span>
  </button>
);

/* 13 · Charm walks in with the pack, sets it down, and leaves it there. */
export const CharmDelivery = ({ onOpen }: Entry): ReactElement => (
  <div className="absolute bottom-3 right-3 flex items-end gap-2">
    <button type="button" onClick={onOpen} className="e2-drop mb-6">
      <FoilPack size="mini" tier={RarityTier.Emerald} className="scale-125" />
    </button>
    <img src={charmArt.inviteFriends} alt="" className="e2-walk h-28 w-28 object-contain drop-shadow-xl" />
  </div>
);
