import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RarityTier } from '../assets';
import { byId } from '../catalog';
import { CardDeck } from '../CardDeck';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import { Avatar, ME } from '../people';
import { HERO, HERO_CLAIM, NotificationRow, Thumb } from './mocks';
import { DECK, FoilPack, PackStrip, PackStyles } from './pack';

const WHITE_MARK = { '--theme-text-primary': '#FFFFFF' } as CSSProperties;

/* -------------------------------------------------------------------------- */
/* The pop-up: the deck, over the feed                                         */
/* -------------------------------------------------------------------------- */

const CARDS = DECK.map((id) => ({ candidate: byId(id), data: sampleData[id] }));

/**
 * What every entry point opens. The same deck as `13. The deck`: drag a card
 * and it goes to the back, the dots underneath track it. Nothing else on the
 * screen; the feed dims behind it.
 */
export const ReplayPopup = ({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement | null => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  // Rendered as a sibling of the Page, never inside it: sections carry transforms that would trap a fixed overlay.
  return (
    <div
      role="dialog"
      aria-label="Your Replay"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, background: 'rgba(12,14,19,.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <FrameStyles />
      <div className="flex flex-col items-center gap-4" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="flex w-full items-center justify-between text-white">
          <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] typo-caption2" style={{ color: 'rgba(255,255,255,.7)' }}>
            <FoilPack size="icon" tier={RarityTier.Emerald} />
            Week 37 · your Replay
          </span>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-[999px] text-white" style={{ background: 'rgba(255,255,255,.12)' }} aria-label="Close">
            ×
          </button>
        </div>
        <CardDeck cards={CARDS} width={360} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Entry points. Every one of them takes onOpen and nothing else.              */
/* -------------------------------------------------------------------------- */

type Entry = { onOpen: () => void };

const Cta = ({ children, invert = false, small = false }: { children: ReactNode; invert?: boolean; small?: boolean }): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-10 font-bold',
      small ? 'px-2.5 py-1 typo-caption1' : 'px-3.5 py-2 typo-callout',
      invert ? 'bg-white text-[#2A0B3D]' : 'bg-text-primary text-surface-invert',
    )}
  >
    {children}
  </span>
);

const Play = (): ReactElement => (
  <span className="inline-block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current" aria-hidden />
);

/** 1 · A sealed pack in a slot. The pack is the button. */
export const PackTile = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex h-full min-h-[21rem] w-full flex-col items-center justify-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left hover:border-border-subtlest-secondary">
    <PackStyles />
    <FoilPack tier={RarityTier.Emerald} breathe />
    <span className="text-center text-text-primary typo-footnote">
      <b>Week 37 is in.</b>
      <br />
      <span className="text-text-tertiary">Five cards about your week</span>
    </span>
    <Cta small>Open</Cta>
  </button>
);

/** 2 · The strip above the feed. */
export const StripEntry = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="w-full text-left">
    <PackStrip state="sealed" />
  </button>
);

/** 3 · Spotify's pill: small, coloured, in the tabs row, all week. */
export const WrappedPill = ({ onOpen }: Entry): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="inline-flex items-center gap-2 rounded-[999px] py-1.5 pl-1.5 pr-3.5 font-bold text-white typo-footnote"
    style={{ background: 'linear-gradient(90deg, #CE3DF3 0%, #887BF8 55%, #29D8E5 130%)', boxShadow: '0 8px 20px -10px rgba(206,61,243,.8)' }}
  >
    <span className="flex h-6 w-6 items-center justify-center rounded-[999px] bg-white/20">
      <Play />
    </span>
    Your week 37 Replay
  </button>
);

/** 4 · Apple Music Replay: a wide highlight with the cards as cover art. */
export const HighlightCard = ({ onOpen }: Entry): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="relative flex h-full min-h-[21rem] w-full items-stretch overflow-hidden rounded-16 text-left text-white"
    style={{ background: 'radial-gradient(90% 120% at 100% 0%, rgba(206,61,243,.55) 0%, transparent 55%), linear-gradient(160deg, #1A0A26 0%, #2A0B3D 60%, #1A1633 100%)' }}
  >
    <FrameStyles />
    <div className="flex flex-1 flex-col justify-between p-5">
      <span className="flex items-center gap-2 font-mono uppercase tracking-[0.16em] typo-caption2" style={{ color: 'rgba(255,255,255,.6)' }}>
        <span className="flex h-4 w-4 [&_svg]:h-full [&_svg]:w-full" style={WHITE_MARK}>
          <LogoIcon />
        </span>
        Replay · week 37
      </span>
      <div className="flex flex-col gap-2">
        <span className="typo-title2">{HERO_CLAIM}</span>
        <span className="typo-footnote" style={{ color: 'rgba(255,255,255,.7)' }}>Five cards. Forty seconds. Updated every Monday.</span>
      </div>
      <Cta invert>
        <Play /> Play your Replay
      </Cta>
    </div>
    <div className="relative w-[46%]">
      {[2, 1, 0].map((index) => (
        <div key={DECK[index]} className="absolute" style={{ right: 16 + index * 34, top: 28 + index * 14, transform: `rotate(${index * 6 - 4}deg)`, zIndex: 3 - index, opacity: 1 - index * 0.18 }}>
          <FrameThumb width={118} candidate={byId(DECK[index])} data={sampleData[DECK[index]]} />
        </div>
      ))}
    </div>
  </button>
);

/** 5 · Strava's weekly snapshot: the numbers first, the Replay as the door. */
export const WeeklySnapshot = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex w-full items-center gap-5 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-5 py-3 text-left hover:border-border-subtlest-secondary">
    <span className="flex flex-col">
      <span className="font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2">Your week 37</span>
      <span className="font-bold text-text-primary typo-callout">{HERO_CLAIM}</span>
    </span>
    <span className="ml-auto flex items-center gap-6">
      {[
        ['47', 'reads'],
        ['3.1h', 'reading'],
        ['Top 2%', 'in k8s'],
        ['1', 'Emerald'],
      ].map(([figure, label]) => (
        <span key={label} className="flex flex-col items-end">
          <span className="font-bold text-text-primary typo-title3" style={{ fontVariantNumeric: 'tabular-nums' }}>{figure}</span>
          <span className="text-text-quaternary typo-caption2">{label}</span>
        </span>
      ))}
    </span>
    <Cta small>See the 5 cards →</Cta>
  </button>
);

/** 6 · A story ring around the avatar in the header. */
export const StoryRing = ({ onOpen, size = 30 }: Entry & { size?: number }): ReactElement => (
  <button type="button" onClick={onOpen} className="relative flex items-center justify-center rounded-[999px] p-[2px]" style={{ background: 'conic-gradient(from 200deg, #CE3DF3, #FF9157, #FFE24C, #57E087, #29D8E5, #CE3DF3)' }} title="Week 37 is in">
    <span className="rounded-[999px] bg-background-default p-[2px]">
      <Avatar person={ME} size={size} />
    </span>
    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-[999px] border-2 border-background-default bg-accent-cabbage-default text-white">
      <span className="h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-current" />
    </span>
  </button>
);

/** 6b · The tray version: a ring under the tabs, like a story someone posted. */
export const StoryBubble = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex flex-col items-center gap-1.5">
    <span className="rounded-[999px] p-[3px]" style={{ background: 'conic-gradient(from 200deg, #CE3DF3, #FF9157, #FFE24C, #57E087, #29D8E5, #CE3DF3)' }}>
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[999px] border-[3px] border-background-default" style={{ background: 'linear-gradient(160deg, #2A0B3D, #5A1E75)' }}>
        <FoilPack size="mini" tier={RarityTier.Emerald} />
      </span>
    </span>
    <span className="font-bold text-text-primary typo-caption1">Your week</span>
  </button>
);

/** 7 · Reddit's banner: loud, wide, once a week, with a close. */
export const RecapBanner = ({ onOpen }: Entry): ReactElement => (
  <div className="relative flex w-full items-center gap-5 overflow-hidden rounded-16 px-6 py-4 text-white" style={{ background: 'linear-gradient(100deg, #2A0B3D 0%, #6D3EF2 55%, #CE3DF3 100%)' }}>
    <FrameStyles />
    <div className="flex -space-x-8">
      {DECK.slice(0, 3).map((id, index) => (
        <div key={id} style={{ transform: `rotate(${(index - 1) * 8}deg) translateY(${Math.abs(index - 1) * 6}px)`, zIndex: 3 - index }}>
          <FrameThumb width={64} candidate={byId(id)} data={sampleData[id]} />
        </div>
      ))}
    </div>
    <div className="flex flex-1 flex-col">
      <span className="typo-title3">{HERO_CLAIM}</span>
      <span className="typo-footnote" style={{ color: 'rgba(255,255,255,.75)' }}>Your week 37 Replay is in. Five cards, one of them Emerald.</span>
    </div>
    <button type="button" onClick={onOpen}>
      <Cta invert>See your Replay</Cta>
    </button>
    <span className="absolute right-3 top-2 text-white/60 typo-caption1">×</span>
  </div>
);

/** 8 · Duolingo's prompt: a small modal on the first Monday session. */
export const MondayPrompt = ({ onOpen }: Entry): ReactElement => (
  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(12,14,19,.45)' }}>
    <div className="flex w-[22rem] flex-col items-center gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-default p-6 text-center shadow-3">
      <PackStyles />
      <FoilPack tier={RarityTier.Emerald} breathe />
      <div className="flex flex-col gap-1">
        <span className="text-text-primary typo-title3">Your week 37 Replay is ready</span>
        <span className="text-text-tertiary typo-footnote">{HERO_CLAIM} Four more cards inside.</span>
      </div>
      <button type="button" onClick={onOpen} className="w-full rounded-12 bg-text-primary py-2.5 font-bold text-surface-invert typo-callout">
        Open it
      </button>
      <span className="-mt-2 font-bold text-text-tertiary typo-callout">Later today</span>
    </div>
  </div>
);

/** 9 · The bell: the notification row is the entry, the dropdown is the frame. */
export const BellDropdown = ({ onOpen }: Entry): ReactElement => (
  <div className="absolute right-5 top-14 w-[24rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3">
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-3">
      <span className="font-bold text-text-primary typo-body">Notifications</span>
      <span className="text-text-quaternary typo-caption1">Mark all as read</span>
    </div>
    <button type="button" onClick={onOpen} className="w-full text-left">
      <NotificationRow title={HERO_CLAIM} description="Your week 37 Replay. Four more cards inside." thumbId={HERO.id} time="now" />
    </button>
    <NotificationRow unread={false} person={ME} title={<><b>Kelsey H.</b> replied to your comment</>} time="3h" />
  </div>
);

/** 10 · A floating button: the pack, bottom right, over the feed. */
export const FloatingPack = ({ onOpen, mobile = false }: Entry & { mobile?: boolean }): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className={classNames('absolute flex items-center gap-3 rounded-[999px] bg-text-primary text-surface-invert shadow-3', mobile ? 'bottom-4 right-4 p-2 pr-4' : 'bottom-5 right-5 p-2 pr-5')}
  >
    <PackStyles />
    <span className="flex h-10 w-10 items-center justify-center rounded-[999px]" style={{ background: 'linear-gradient(160deg, #2A0B3D, #5A1E75)' }}>
      <FoilPack size="mini" tier={RarityTier.Emerald} className="scale-75" />
    </span>
    <span className="flex flex-col text-left">
      <span className="font-bold typo-footnote">Week 37 is in</span>
      <span className="typo-caption2 opacity-70">Tap to open</span>
    </span>
  </button>
);

/** 11 · A post-shaped card: the baseline, done properly. */
export const NativeCard = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex h-full min-h-[21rem] w-full flex-col gap-3 rounded-16 border border-accent-cabbage-default/50 bg-surface-float p-3 text-left">
    <FrameStyles />
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-[999px] bg-accent-cabbage-default text-white [&_svg]:h-3 [&_svg]:w-3" style={WHITE_MARK}>
        <LogoIcon />
      </span>
      <span className="text-text-tertiary typo-footnote">Replay · week 37</span>
      <span className="ml-auto rounded-6 bg-accent-cabbage-default px-1.5 py-0.5 font-mono uppercase text-white typo-caption2">new</span>
    </div>
    <h3 className="font-bold text-text-primary typo-title3">{HERO_CLAIM}</h3>
    <div className="relative mt-auto flex h-32 items-end justify-center overflow-hidden rounded-12" style={{ background: 'linear-gradient(160deg, #2A0B3D, #5A1E75)' }}>
      {[1, 0, 2].map((index, position) => (
        <div key={DECK[index]} className="absolute bottom-[-40%]" style={{ left: `${18 + position * 26}%`, transform: `rotate(${(position - 1) * 10}deg)`, zIndex: position === 1 ? 3 : 1 }}>
          <FrameThumb width={70} candidate={byId(DECK[index])} data={sampleData[DECK[index]]} />
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between text-text-tertiary typo-caption1">
      <span className="flex items-center gap-1">
        <UpvoteIcon size={IconSize.Small} /> 5 cards
      </span>
      <span className="flex items-center gap-1">
        <DiscussIcon size={IconSize.Small} /> 40s
      </span>
      <Cta small>Open</Cta>
    </div>
  </button>
);

/** 12 · Instagram's "You're all caught up", with the week as the payload. */
export const CaughtUpDivider = ({ onOpen }: Entry): ReactElement => (
  <div className="col-span-3 flex flex-col items-center gap-3 py-6">
    <span className="flex w-full items-center gap-4">
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
      <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <span className="flex h-5 w-5 items-center justify-center rounded-[999px] bg-accent-avocado-default text-white typo-caption2">✓</span>
        You&apos;re all caught up
      </span>
      <span className="h-px flex-1 bg-border-subtlest-tertiary" />
    </span>
    <button type="button" onClick={onOpen} className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float py-3 pl-3 pr-4 hover:border-border-subtlest-secondary">
      <PackStyles />
      <FoilPack size="mini" tier={RarityTier.Emerald} />
      <span className="flex flex-col text-left">
        <span className="font-bold text-text-primary typo-callout">That was everything new. Here is your week.</span>
        <span className="text-text-tertiary typo-footnote">{HERO_CLAIM} Five cards.</span>
      </span>
      <Cta small>Open</Cta>
    </button>
  </div>
);

/** For the mobile page: the same entries at phone width. */
export const MobileStrip = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 rounded-12 px-3 py-2 text-left text-white" style={{ background: 'linear-gradient(90deg, #2A0B3D 0%, #5A1E75 70%, #7A2A9C 100%)' }}>
    <FoilPack size="mini" tier={RarityTier.Emerald} />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-footnote">{HERO_CLAIM}</span>
      <span className="truncate text-white/65 typo-caption2">Week 37 · 5 cards</span>
    </span>
    <span className="rounded-8 bg-white px-2.5 py-1 font-bold text-[#2A0B3D] typo-caption1">Open</span>
  </button>
);

export const HeaderBell = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="relative flex h-9 w-9 items-center justify-center rounded-10 bg-surface-float text-text-primary">
    <BellIcon size={IconSize.Small} secondary />
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[999px] bg-accent-cabbage-default px-1 font-bold text-white typo-caption2">1</span>
  </button>
);

export const ThumbEntry = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen}>
    <Thumb id={HERO.id} width={44} />
  </button>
);
