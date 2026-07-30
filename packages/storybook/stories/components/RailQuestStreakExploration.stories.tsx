import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import {
  railTabClass,
  railTabLabelClass,
  RAIL_ICON_SIZE,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import {
  BellIcon,
  GiftIcon,
  HomeIcon,
  HotIcon,
  JoystickIcon,
  MagicIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

// EXPLORATION — how should ONE rail tab carry BOTH the reading streak and quests?
//
// The problem, stated plainly: the v2 rail gives gamification a single tab —
// a 26px glyph box and one short text label under it, in a 68px-wide column.
// That one tab has to say four things at once:
//
//   1. the reading streak day count            (73)
//   2. the streak's urgency state              (safe / at-risk / critical / rest)
//   3. how far through today's quests you are  (2 of 3)
//   4. that a reward is sitting there unclaimed (the thing we most want clicked)
//
// Today only (1), (2) and a bare count for (4) are expressed. Ten directions
// below, each a different STRATEGY for splitting those four messages across the
// channels the tab actually owns: the ring, the glyph, the corner, the label,
// the space under the glyph, motion, and — last resort — a second tab.
//
// COLOUR SYSTEM (not invented here — read off the existing components, so every
// idea below stays inside the language the product already speaks):
//   pink   / accent-bacon    → the reading streak        (StreakBadge fill)
//   green  / accent-avocado  → quest progress in flight  (QuestLevelProgressCircle)
//   purple / accent-cabbage  → a reward ready to claim   (Bubble)
// Progress is green while you work, purple the moment there is something to take.
//
// Nothing here is wired into the rail. Use the Playground story to drive all ten
// from one set of controls and compare them under the same signal.
//
// The five first-pass options live in "Rail quest indicator" — this page is the
// deeper exploration, and every story here also draws TODAY'S behaviour as the
// control, because an option is only worth shipping if it beats the baseline.

// ─── the signal every idea renders from ──────────────────────────────────────

interface RailSignal {
  streakState: StreakRingState;
  hasReadToday: boolean;
  days: number;
  // Quests finished out of today's set.
  done: number;
  total: number;
  // Finished quests whose reward has not been collected yet.
  claimable: number;
}

const DEFAULT_SIGNAL: RailSignal = {
  streakState: 'safe',
  hasReadToday: true,
  days: 73,
  done: 2,
  total: 3,
  claimable: 1,
};

const progressOf = ({ done, total }: RailSignal): number =>
  total ? Math.min(100, (done / total) * 100) : 0;

// Below the smallest typo step (caption2 is 12px), which is what a numeral has to
// be to sit inside a 26px glyph without pushing its own box around.
const microNumeral = 'text-[0.5625rem] font-bold leading-none tabular-nums';

// ─── shared drawing primitives ───────────────────────────────────────────────

const GLYPH = 26;

// The rail's glyph box. Every idea must fit inside this, or say that it doesn't.
const GlyphBox = ({
  children,
  size = GLYPH,
}: {
  children: React.ReactNode;
  size?: number;
}) => (
  <span
    className="relative flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    {children}
  </span>
);

// One arc per quest, laid around the glyph — a segmented ring rather than a
// continuous one, so "2 of 3" is countable instead of estimated.
const SegmentRing = ({
  total,
  done,
  size = GLYPH,
  stroke = 2,
}: {
  total: number;
  done: number;
  size?: number;
  stroke?: number;
}): ReactElement => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const step = circumference / Math.max(1, total);
  // Round caps add stroke/2 at each end, so the gap has to absorb a full stroke
  // before it reads as a gap at all — at stroke+2 two finished arcs merged into
  // one and "2 of 3" became uncountable.
  const gap = stroke + 5;
  const segment = Math.max(0.5, step - gap);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className="absolute inset-0 -rotate-90"
      aria-hidden
    >
      {Array.from({ length: Math.max(1, total) }, (_, index) => (
        <circle
          key={index}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${segment} ${circumference - segment}`}
          strokeDashoffset={-index * step}
          className={
            index < done
              ? 'stroke-accent-avocado-default'
              : 'stroke-border-subtlest-tertiary'
          }
        />
      ))}
    </svg>
  );
};

// A continuous progress arc, for the ideas that show "how far" rather than "how many".
const ProgressArc = ({
  progress,
  size = GLYPH,
  stroke = 1.5,
  showTrack = true,
  className,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  showTrack?: boolean;
  className?: string;
}): ReactElement => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={classNames('absolute -rotate-90', className)}
      aria-hidden
    >
      {showTrack && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-border-subtlest-tertiary"
        />
      )}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.max(0, Math.min(100, progress)) / 100)}
        className="stroke-accent-avocado-default transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
};

// The streak disc WITHOUT its flame — ring + fill only, mirroring StreakBadge's
// state colours. Ideas 1, 5 and 10 compose their own contents inside the disc, so
// they cannot nest the real badge (it would draw a second flame behind theirs).
const ringColorByState: Partial<Record<StreakRingState, string>> = {
  none: 'border-text-quaternary',
  pending: 'border-text-tertiary',
  safe: 'border-accent-bacon-default',
  celebration: 'border-accent-bacon-default',
  at_risk: 'border-status-warning',
  critical: 'border-status-error',
  freeze: 'border-accent-blueCheese-default',
};

const discFillByState: Partial<Record<StreakRingState, string>> = {
  safe: 'bg-accent-bacon-default',
  celebration: 'bg-accent-bacon-default',
  freeze: 'bg-accent-blueCheese-flat',
};

const StreakDisc = ({
  signal,
  showRing = true,
  showFill = true,
  children,
}: {
  signal: RailSignal;
  showRing?: boolean;
  showFill?: boolean;
  children: React.ReactNode;
}) => (
  <>
    {showFill && (
      <span
        aria-hidden
        className={classNames(
          'absolute inset-[1.5px] rounded-full',
          discFillByState[signal.streakState] ?? 'bg-transparent',
        )}
      />
    )}
    {showRing && (
      <span
        aria-hidden
        className={classNames(
          'absolute inset-[1.5px] rounded-full border-[1.5px]',
          ringColorByState[signal.streakState] ?? 'border-text-tertiary',
        )}
      />
    )}
    {children}
  </>
);

// The flame on its own, in the streak's colour — for the ideas that rebuild the
// glyph instead of nesting the real StreakBadge inside something.
const flameColorByState: Partial<Record<StreakRingState, string>> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  safe: 'text-accent-bacon-default',
  celebration: 'text-accent-bacon-default',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

const Flame = ({
  signal,
  size = IconSize.Size16,
  // On a filled disc the flame has to invert, exactly as StreakBadge does.
  onFill = false,
  className,
}: {
  signal: RailSignal;
  size?: IconSize;
  onFill?: boolean;
  className?: string;
}) => (
  <HotIcon
    secondary={signal.hasReadToday || signal.streakState === 'freeze'}
    size={size}
    className={classNames(
      'relative',
      onFill && discFillByState[signal.streakState]
        ? 'text-white'
        : flameColorByState[signal.streakState] ?? 'text-text-tertiary',
      className,
    )}
  />
);

// ─── the ten ideas ───────────────────────────────────────────────────────────

// 1 — The ring becomes the quest tracker. The streak keeps the glyph (flame +
// its state colour); the circle around it splits into one arc per quest.
const IdeaSegmentedRing = (signal: RailSignal) => (
  <GlyphBox>
    <SegmentRing total={signal.total} done={signal.done} />
    <Flame signal={signal} size={IconSize.XSmall} />
  </GlyphBox>
);

// 2 — A single gem set INTO the ring. Not a floating badge: it sits on the ring's
// own path, so the glyph's box never grows and it can't collide with the bell's
// bubble. Binary — "something is waiting" — with the count left to the label.
const IdeaRingGem = (signal: RailSignal) => (
  <GlyphBox>
    <StreakBadge state={signal.streakState} hasReadToday={signal.hasReadToday} />
    {signal.claimable > 0 && (
      <span
        aria-hidden
        // 45° along a 23px ring: 11.5 × cos45 ≈ 8.1px from centre, minus half the
        // gem, which lands it at 1.4px from the box's corner — fully inside.
        className="absolute right-[1.4px] top-[1.4px] size-[7px] rounded-full bg-accent-cabbage-default ring-1 ring-background-default"
      />
    )}
  </GlyphBox>
);

// The untouched badge — shared by every idea that puts its quest signal somewhere
// other than the glyph (3 the label, 7 the strip below, 9 a second tab).
const IdeaPlainBadge = (signal: RailSignal) => (
  <GlyphBox>
    <StreakBadge state={signal.streakState} hasReadToday={signal.hasReadToday} />
  </GlyphBox>
);

// 3 — Leave the glyph alone entirely and time-share the LABEL, the one channel
// already sized for words. The day count and the call to action alternate.
const TimeSharedLabelText = ({ signal }: { signal: RailSignal }) => {
  const [showClaim, setShowClaim] = useState(false);

  useEffect(() => {
    if (!signal.claimable) {
      setShowClaim(false);
      return undefined;
    }
    const id = setInterval(() => setShowClaim((prev) => !prev), 2200);
    return () => clearInterval(id);
  }, [signal.claimable]);

  return (
    <span className="relative block h-4 overflow-hidden">
      <span
        className={classNames(
          'block transition-[opacity,transform] duration-300 ease-out',
          showClaim ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        {signal.days}
      </span>
      <span
        className={classNames(
          'absolute inset-x-0 top-0 block font-bold text-accent-cabbage-default transition-[opacity,transform] duration-300 ease-out',
          showClaim ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        Claim
      </span>
    </span>
  );
};

// 4 — An app-icon-style chip, but INSET rather than overflowing: it tucks into
// the box's bottom-right corner, so the whole thing still measures 26px.
const IdeaInsetChip = (signal: RailSignal) => (
  <GlyphBox>
    {/* inline-block: a transform has no effect on an inline element. */}
    <span className="inline-block scale-[0.82]">
      <StreakBadge
        state={signal.streakState}
        hasReadToday={signal.hasReadToday}
      />
    </span>
    {signal.claimable > 0 && (
      <span
        className={classNames(
          // A BORDER, not a ring, for the gap against the badge: a border is
          // inside the chip's own box, so the chip cannot push past the 26px
          // glyph — which is the whole point of this option.
          'absolute bottom-0 right-0 flex h-[13px] min-w-[13px] items-center justify-center rounded-full border-2 border-background-default bg-accent-cabbage-default px-[3px] text-white',
          microNumeral,
        )}
      >
        {signal.claimable}
      </span>
    )}
  </GlyphBox>
);

// 5 — The flame itself is the progress bar: it fills from the bottom as you
// finish today's quests. One glyph carrying two channels — ring colour is the
// streak, fill level is the quests.
// The filled flame's ink is 15px tall inside its 20px box (2.5px margin each
// side), so the fill window is measured against the INK, not the box — otherwise
// "66% done" leaves a full flame and the level stops meaning anything.
const FLAME_INK_HEIGHT = 15;
const FLAME_INK_MARGIN = 2.5;

const IdeaLiquidFlame = (signal: RailSignal) => {
  const progress = progressOf(signal);
  const fillHeight = FLAME_INK_MARGIN + (FLAME_INK_HEIGHT * progress) / 100;

  return (
    <GlyphBox>
      <StreakDisc signal={signal} showFill={false}>
        <span className="relative size-5">
          {/* The unfilled level is the SOLID flame in a track colour, not the
              outlined one — mixing the two silhouettes read as a smudge rather
              than a flame filling up. */}
          <HotIcon
            secondary
            size={IconSize.XSmall}
            className="absolute inset-0 text-border-subtlest-tertiary"
          />
          <span
            className="absolute inset-x-0 bottom-0 overflow-hidden transition-[height] duration-300 ease-out"
            style={{ height: fillHeight }}
          >
            {/* Re-anchored at full height so the clip reveals the icon bottom-up. */}
            <span className="absolute inset-x-0 bottom-0 block h-5">
              <HotIcon
                secondary
                size={IconSize.XSmall}
                className={
                  signal.claimable > 0
                    ? 'text-accent-cabbage-default'
                    : 'text-accent-avocado-default'
                }
              />
            </span>
          </span>
        </span>
      </StreakDisc>
    </GlyphBox>
  );
};

// 6 — Change nothing about the shape. A soft purple aura breathes behind the
// badge while a reward is waiting: attention through light instead of geometry,
// so no information is displaced and nothing is hidden.
const IdeaBreathingHalo = (signal: RailSignal) => (
  <GlyphBox>
    {signal.claimable > 0 && (
      <span
        aria-hidden
        className="absolute -inset-1 animate-pulse rounded-full bg-accent-cabbage-default opacity-40 blur-[6px] motion-reduce:animate-none"
      />
    )}
    <StreakBadge state={signal.streakState} hasReadToday={signal.hasReadToday} />
  </GlyphBox>
);

// 7 — Borrow the strip between glyph and label. Pagination-style dots, one per
// quest — the glyph stays 100% the streak's, and the quest state is countable.
const MicroDotsRow = ({ signal }: { signal: RailSignal }) => (
  <span aria-hidden className="flex items-center justify-center gap-[3px]">
    {Array.from({ length: signal.total }, (_, index) => (
      <span
        key={index}
        className={classNames(
          'size-1 rounded-full transition-colors',
          index < signal.done
            ? 'bg-accent-avocado-default'
            : 'bg-border-subtlest-tertiary',
        )}
      />
    ))}
  </span>
);

// 8 — A transient takeover instead of a permanent one. The glyph morphs to a
// gift for a beat when a reward lands, then hands the tab back to the streak and
// leaves the quiet chip behind. Answers the "the streak loses its home" problem.
const IdeaMorphAnnouncement = (signal: RailSignal) => {
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    if (!signal.claimable) {
      setShowGift(false);
      return undefined;
    }
    const id = setInterval(() => setShowGift((prev) => !prev), 2600);
    return () => clearInterval(id);
  }, [signal.claimable]);

  return (
    <GlyphBox>
      <span
        className={classNames(
          'absolute transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          showGift ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        <StreakBadge
          state={signal.streakState}
          hasReadToday={signal.hasReadToday}
        />
      </span>
      <span
        className={classNames(
          'absolute flex size-[23px] items-center justify-center rounded-full bg-accent-cabbage-default text-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          showGift ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        )}
      >
        <GiftIcon secondary size={IconSize.Size16} />
      </span>
    </GlyphBox>
  );
};

// 9 — Stop compressing. Two tabs, each unambiguous, each with its own label and
// its own badge. The honest baseline the nine clever options have to beat.
const QuestSiblingTab = ({ signal }: { signal: RailSignal }) => (
  <span className={classNames(railTabClass, 'w-[68px]')}>
    <span className="relative flex items-center justify-center">
      <JoystickIcon size={RAIL_ICON_SIZE} aria-hidden />
      {signal.claimable > 0 && (
        <Bubble className="-right-2 -top-2 px-1">{signal.claimable}</Bubble>
      )}
    </span>
    <span className={railTabLabelClass}>Quests</span>
  </span>
);

// 10 — Two concentric rings, both inside 26px: the streak keeps its outer ring
// untouched, and the quest arc is drawn INSIDE it. The flame shrinks to make
// room — the cost is paid by the glyph, not by the rail's rhythm.
const IdeaInnerArc = (signal: RailSignal) => (
  <GlyphBox>
    <StreakDisc signal={signal}>
      {/* No track: a grey ring over the streak's pink fill reads as mud, and the
          outer ring already gives the arc a circle to be measured against. */}
      <ProgressArc
        progress={progressOf(signal)}
        size={18}
        stroke={1.5}
        showTrack={false}
      />
      <Flame signal={signal} size={IconSize.XXSmall} onFill />
    </StreakDisc>
  </GlyphBox>
);

// ─── idea catalogue ──────────────────────────────────────────────────────────

interface Idea {
  n: number;
  title: string;
  mechanic: string;
  pro: string;
  con: string;
  // Renders the glyph for a given signal.
  glyph: (signal: RailSignal) => ReactElement;
  // Overrides the tab's label (default: the day count).
  label?: (signal: RailSignal) => ReactElement | string;
  // Extra row between glyph and label.
  underGlyph?: (signal: RailSignal) => ReactElement | null;
  // Renders a second tab alongside.
  sibling?: (signal: RailSignal) => ReactElement;
}

const IDEAS: Idea[] = [
  {
    n: 1,
    title: 'Segmented quest ring',
    mechanic:
      'The circle around the flame splits into one arc per quest; arcs fill green as you finish them.',
    pro: 'Reuses a ring that already exists, so it costs zero extra pixels. "2 of 3" is countable, not estimated.',
    con: 'The streak loses the ring as its state channel — urgency has to live in the flame colour alone.',
    glyph: IdeaSegmentedRing,
  },
  {
    n: 2,
    title: 'Gem set into the ring',
    mechanic:
      'A 7px purple gem, centred on the streak ring at 45° so it straddles the stroke rather than floating off the corner.',
    pro: 'Stays inside the glyph box, so it cannot collide with the notification bubble above it. Reads as one object.',
    con: 'Binary only — it says "something is waiting", never how much. The count has to move to the label.',
    glyph: IdeaRingGem,
  },
  {
    n: 3,
    title: 'Time-shared label',
    mechanic:
      'The glyph never changes. The label alternates between the day count and "Claim" every 2.2s.',
    pro: 'Uses the one channel already built for words, so the message is literal instead of decoded. Cheapest to ship.',
    con: 'Half the time the day count is not on screen, and moving text in a fixed rail can read as noise.',
    glyph: IdeaPlainBadge,
    label: (signal) => <TimeSharedLabelText signal={signal} />,
  },
  {
    n: 4,
    title: 'Inset corner chip',
    mechanic:
      'App-icon badge, but tucked inside: the badge scales to 82% and the count chip fills the freed corner.',
    pro: 'Carries an exact count and still measures 26px. Instantly familiar from every mobile home screen.',
    con: 'Shrinking the streak badge breaks the icon-size consistency pass the rail just went through.',
    glyph: IdeaInsetChip,
  },
  {
    n: 5,
    title: 'Liquid-fill flame',
    mechanic:
      'The flame fills bottom-up with quest progress — green while working, purple once claimable.',
    pro: 'One glyph, two channels, no added marks. The most game-like and the most distinctive option here.',
    con: 'Worst on the state matrix: the fill colour owns the flame, so all six streak states look nearly identical and "read today" stops reading at all.',
    glyph: IdeaLiquidFlame,
  },
  {
    n: 6,
    title: 'Breathing halo',
    mechanic:
      'Geometry untouched. A soft purple aura pulses behind the badge while a reward waits.',
    pro: 'Displaces nothing and hides nothing — the streak keeps every channel it has. Reads in peripheral vision.',
    con: 'Motion in a persistent rail gets tuned out fast, and it carries no count at all.',
    glyph: IdeaBreathingHalo,
  },
  {
    n: 7,
    title: 'Micro dots under the glyph',
    mechanic:
      'A row of dots between glyph and label, one per quest, filled as each completes.',
    pro: 'The glyph stays 100% the streak’s. Progress is countable and the pattern is already understood.',
    con: 'Costs ~7px of tab height, so every rail tab grows or this one stops matching its neighbours.',
    glyph: IdeaPlainBadge,
    underGlyph: (signal) => <MicroDotsRow signal={signal} />,
  },
  {
    n: 8,
    title: 'Morph announcement',
    mechanic:
      'The glyph springs from flame to gift when a reward lands, holds a beat, then springs back.',
    pro: 'Gets the loudest possible moment without permanently evicting the streak. Best of A and B.',
    con: 'If you look away during the beat you miss it — it needs a quiet resting badge as a fallback.',
    glyph: IdeaMorphAnnouncement,
  },
  {
    n: 9,
    title: 'Two tabs',
    mechanic:
      'Give up on one tab. Streak and Quests become siblings, each with its own glyph, label and badge.',
    pro: 'Zero ambiguity and zero compromise — both features get a real name and a real target.',
    con: 'Costs a full row of rail height, and the rail already folds tabs into the More menu when short.',
    glyph: IdeaPlainBadge,
    sibling: (signal) => <QuestSiblingTab signal={signal} />,
  },
  {
    n: 10,
    title: 'Inner concentric arc',
    mechanic:
      'The quest arc is drawn INSIDE the streak ring; the flame shrinks to 12px to make room.',
    pro: 'Both rings live in 26px, so the rail rhythm is untouched and the streak keeps its full state ring.',
    con: 'At this size the arc and the shrunken flame are near the limit of legibility — verify on a real display.',
    glyph: IdeaInnerArc,
  },
];

// ─── presentation ────────────────────────────────────────────────────────────

// One idea drawn as the real rail tab (68px column, railTabClass, label slot).
const IdeaTab = ({
  idea,
  signal,
}: {
  idea: Idea;
  signal: RailSignal;
}): ReactElement => {
  const label = idea.label?.(signal) ?? `${signal.days}`;
  const under = idea.underGlyph?.(signal);

  // The rail is a column, so a second tab stacks BELOW rather than beside.
  return (
    <span className="flex flex-col items-center gap-1">
      <span className={classNames(railTabClass, 'group/streaktab w-[68px]')}>
        <span className="relative flex items-center justify-center">
          {idea.glyph(signal)}
        </span>
        {under}
        <span className={railTabLabelClass}>{label}</span>
      </span>
      {idea.sibling?.(signal)}
    </span>
  );
};

const IdeaCard = ({
  idea,
  signal,
}: {
  idea: Idea;
  signal: RailSignal;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex items-baseline gap-2">
      <span className="font-bold text-text-quaternary typo-callout tabular-nums">
        {String(idea.n).padStart(2, '0')}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {idea.title}
      </span>
    </div>
    <div className="flex items-start gap-4">
      <span className="rounded-12 bg-background-default p-1">
        <IdeaTab idea={idea} signal={signal} />
      </span>
      <p className="flex-1 text-text-secondary typo-caption1">
        {idea.mechanic}
      </p>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-text-tertiary typo-caption1">
        <span className="text-status-success">+</span> {idea.pro}
      </p>
      <p className="text-text-tertiary typo-caption1">
        <span className="text-status-error">−</span> {idea.con}
      </p>
    </div>
  </div>
);

// TODAY — the control. The streak badge with a floating count bubble in the
// corner, which is what the rail ships right now.
const TodayBaseline = ({ signal }: { signal: RailSignal }): ReactElement => (
  <span className={classNames(railTabClass, 'group/streaktab w-[68px]')}>
    <span className="relative flex items-center justify-center">
      <StreakBadge
        state={signal.streakState}
        hasReadToday={signal.hasReadToday}
      />
      {signal.claimable > 0 && (
        <Bubble className="-right-2 -top-2 px-1">{signal.claimable}</Bubble>
      )}
    </span>
    <span className={railTabLabelClass}>{signal.days}</span>
  </span>
);

const BaselineStrip = ({ signal }: { signal: RailSignal }): ReactElement => (
  <div className="flex items-center gap-4 rounded-16 border border-dashed border-border-subtlest-tertiary p-3">
    <span className="rounded-12 bg-background-default p-1">
      <TodayBaseline signal={signal} />
    </span>
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-text-primary typo-callout">
        Today — the control
      </span>
      <span className="text-text-tertiary typo-caption1">
        Streak badge plus a floating count bubble. The bubble overflows the glyph
        box, so it lands directly under the Activity bell&apos;s own purple
        bubble — and it says nothing about quest progress, only that a number
        exists.
      </span>
    </div>
  </div>
);

const Legend = (): ReactElement => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-12 bg-surface-float px-4 py-3">
    {[
      { color: 'bg-accent-bacon-default', text: 'reading streak' },
      { color: 'bg-accent-avocado-default', text: 'quest progress' },
      { color: 'bg-accent-cabbage-default', text: 'reward ready to claim' },
    ].map(({ color, text }) => (
      <span key={text} className="flex items-center gap-2">
        <span className={classNames('size-3 rounded-full', color)} />
        <span className="text-text-secondary typo-caption1">{text}</span>
      </span>
    ))}
  </div>
);

const STATES: StreakRingState[] = [
  'none',
  'pending',
  'safe',
  'at_risk',
  'critical',
  'freeze',
];

const meta: Meta = {
  title: 'Components/Sidebar/Rail quest + streak exploration',
  decorators: [
    (Story) => (
      <div className="dark min-h-dvh bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-8">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
};

export default meta;

type Story = StoryObj;

// All ten directions with their mechanic and their trade-off, at one shared
// signal (73-day streak, read today, 2 of 3 quests done, 1 reward waiting).
export const TenIdeas: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-text-primary typo-title3">
          Ten ways one rail tab can carry both the streak and quests
        </h2>
        <p className="max-w-3xl text-text-tertiary typo-callout">
          Each option is drawn as a real 68px rail tab. They differ in WHICH
          channel carries the quest signal — the ring, the glyph, a corner, the
          label, the strip under the glyph, motion, or a second tab.
        </p>
      </div>
      <Legend />
      <BaselineStrip signal={DEFAULT_SIGNAL} />
      <div className="grid gap-4 laptop:grid-cols-2">
        {IDEAS.map((idea) => (
          <IdeaCard key={idea.n} idea={idea} signal={DEFAULT_SIGNAL} />
        ))}
      </div>
    </div>
  ),
};

// Drive all ten from one control set. This is the story to sit in while deciding.
export const Playground: Story = {
  args: DEFAULT_SIGNAL,
  argTypes: {
    streakState: { control: 'select', options: STATES },
    hasReadToday: { control: 'boolean' },
    days: { control: { type: 'number', min: 0, max: 999 } },
    done: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    total: { control: { type: 'range', min: 1, max: 5, step: 1 } },
    claimable: { control: { type: 'range', min: 0, max: 9, step: 1 } },
  },
  render: (args) => {
    const signal = args as RailSignal;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-text-primary typo-title3">
            Playground — every idea under the same signal
          </h2>
          <p className="text-text-tertiary typo-callout">
            {signal.done}/{signal.total} quests done · {signal.claimable}{' '}
            claimable · {signal.days}-day streak · {signal.streakState}
          </p>
        </div>
        <Legend />
        <BaselineStrip signal={signal} />
        <div className="flex flex-wrap gap-4">
          {IDEAS.map((idea) => (
            <div
              key={idea.n}
              className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3"
            >
              <IdeaTab idea={idea} signal={signal} />
              <span className="max-w-[120px] text-center text-text-tertiary typo-caption2">
                {String(idea.n).padStart(2, '0')} {idea.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Every glyph at 3x, because most of these live or die on detail that is
// invisible at 26px — stroke weights, gem placement, arc gaps, inner clearance.
export const Zoomed: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-text-primary typo-title3">
        Glyphs at 3x — 2 of 3 quests done, 1 reward waiting
      </h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 laptop:grid-cols-5">
        {IDEAS.map((idea) => (
          <div key={idea.n} className="flex flex-col items-center gap-6">
            <span className="flex h-24 items-center justify-center">
              <span className="inline-block scale-[3]">
                {idea.glyph(DEFAULT_SIGNAL)}
              </span>
            </span>
            <span className="text-center text-text-tertiary typo-caption1">
              {String(idea.n).padStart(2, '0')} {idea.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// The signal that actually matters: does the idea still read as you go from
// "nothing waiting" to "several waiting"?
export const AcrossClaimableCounts: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-text-primary typo-title3">
        0 → 1 → 2 → 3 rewards waiting
      </h2>
      <div className="flex flex-col gap-3">
        {IDEAS.map((idea) => (
          <div
            key={idea.n}
            className="flex items-center gap-4 rounded-12 border border-border-subtlest-tertiary p-2"
          >
            <span className="w-52 shrink-0 pl-2 text-text-secondary typo-caption1">
              {String(idea.n).padStart(2, '0')} {idea.title}
            </span>
            <span className="flex flex-wrap items-start gap-2">
              {[0, 1, 2, 3].map((claimable) => (
                <span
                  key={claimable}
                  className="rounded-12 bg-background-default p-1"
                >
                  <IdeaTab
                    idea={idea}
                    signal={{
                      ...DEFAULT_SIGNAL,
                      claimable,
                      done: Math.min(DEFAULT_SIGNAL.total, claimable + 1),
                    }}
                  />
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// Whichever idea wins has to survive all six streak states — including the amber
// and red danger rings, where a purple quest mark competes for the same glyph.
export const AcrossStreakStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-text-primary typo-title3">
        Every idea against every streak state
      </h2>
      <p className="max-w-3xl text-text-tertiary typo-callout">
        The danger states are the stress test: at-risk (amber) and critical (red)
        need to stay the loudest thing on the tab, or a claimable reward will pull
        attention away from a streak that is about to break.
      </p>
      <div className="flex flex-col gap-3">
        {IDEAS.map((idea) => (
          <div
            key={idea.n}
            className="flex items-center gap-4 rounded-12 border border-border-subtlest-tertiary p-2"
          >
            <span className="w-52 shrink-0 pl-2 text-text-secondary typo-caption1">
              {String(idea.n).padStart(2, '0')} {idea.title}
            </span>
            <span className="flex flex-wrap items-start gap-2">
              {STATES.map((streakState) => (
                <span
                  key={streakState}
                  className="flex flex-col items-center gap-1 rounded-12 bg-background-default p-1"
                >
                  <IdeaTab
                    idea={idea}
                    signal={{
                      ...DEFAULT_SIGNAL,
                      streakState,
                      hasReadToday:
                        streakState === 'safe' || streakState === 'freeze',
                    }}
                  />
                  <span className="text-text-quaternary typo-caption2">
                    {streakState}
                  </span>
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// In situ. A rail tab never appears alone — the notification bell sits right
// above it with its own purple bubble, which is the collision every option that
// overflows the glyph box has to survive.
const MiniRail = ({
  idea,
  signal,
}: {
  idea: Idea;
  signal: RailSignal;
}): ReactElement => (
  <div className="flex w-20 flex-col items-center gap-1 rounded-16 bg-background-default px-1.5 pb-3 pt-[13px]">
    <span className="mb-2.5 flex size-10 items-center justify-center text-text-primary">
      <HomeIcon secondary size={RAIL_ICON_SIZE} />
    </span>
    <span className={classNames(railTabClass, 'w-[68px]')}>
      <span className="relative flex items-center justify-center">
        <BellIcon size={RAIL_ICON_SIZE} aria-hidden />
        <Bubble className="pointer-events-none -top-2 left-2.5 px-1">3</Bubble>
      </span>
      <span className={railTabLabelClass}>Activity</span>
    </span>
    <IdeaTab idea={idea} signal={signal} />
    <span className={classNames(railTabClass, 'w-[68px]')}>
      <span className="relative flex items-center justify-center">
        <MagicIcon size={RAIL_ICON_SIZE} aria-hidden />
      </span>
      <span className={railTabLabelClass}>You</span>
    </span>
  </div>
);

export const InTheRail: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-text-primary typo-title3">
        In situ — under the Activity bell and its purple bubble
      </h2>
      <p className="max-w-3xl text-text-tertiary typo-callout">
        Two purple marks stacked in an 80px column is the real risk. Ideas 2, 5, 6
        and 10 keep everything inside the glyph box and avoid it; 4 sits in a
        corner the bell does not use; 3, 7 and 9 move the signal out of the glyph
        entirely.
      </p>
      <div className="flex flex-wrap gap-4">
        {IDEAS.map((idea) => (
          <div key={idea.n} className="flex flex-col items-center gap-2">
            <MiniRail idea={idea} signal={DEFAULT_SIGNAL} />
            <span className="max-w-[120px] text-center text-text-tertiary typo-caption2">
              {String(idea.n).padStart(2, '0')} {idea.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
