import type { CSSProperties, ReactElement, Ref } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/common';
import {
  CoreIcon,
  LockIcon,
  ReadingStreakIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  QuestRewardFlightLayer,
  buildQuestRewardFlights,
  getQuestRewardHitAt,
} from '@dailydotdev/shared/src/components/quest/QuestRewardAnimations';
import type { QuestRewardFlight } from '@dailydotdev/shared/src/components/quest/QuestRewardAnimations';
import { QuestRewardType } from '@dailydotdev/shared/src/graphql/quests';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import type { PlannedDay } from './weekPlan';
import { FINAL_DAY, GiftKind, weekPlan } from './weekPlan';
import { ARCADE, CoreArt, FreezeArt } from './rewardArt';

// The weekly reading rewards card, as reviewed: one proposal for this modal,
// on the same week plan, art and palette as `ArcadeWeekModal`.
//
// What it answers from review:
//   1. The day is obvious — today is the only lit tile, with the claim in it.
//   2. It reads as the reading streak — the streak flame and the reader's
//      whole streak lead the header, and every read day becomes a flame.
//   3. One tile height in every state — state is colour, flame and check.
//
// And the layout notes that followed: a plain title and the rule, the streak
// count kept apart from the reward week, the balance top right, one ask in the
// footer, and the cast standing over the card's corners.
//
// Responsive: under 420px a bottom sheet with everything stacked; to 655px the
// same sheet with streak and balance on one row; to 1019px a fluid card with
// the seven days across; the cast only from 1120px, where it fits.

export enum Phase {
  /** Today's post not read yet. Nothing is claimable. */
  Unread = 'unread',
  /** Read, today's reward waiting. */
  Ready = 'ready',
  /** Read and collected. */
  Claimed = 'claimed',
}

export interface WeeklyRewardsModalProps {
  /** The live day of the reward week, 1–7. */
  day: number;
  phase: Phase;
  /** The reader's whole reading streak — not the reward day. */
  streakDays: number;
  /**
   * Days read earlier and never collected, 1-based.
   *
   * Reading earns a day and claiming collects it, and the two need not happen
   * together: someone who read yesterday without tapping opens today with two
   * claims waiting. Those days keep their reward art and get a live button of
   * their own; what they do not get is the lit frame, which is today's alone.
   */
  pendingDays?: number[];
  isClaiming?: boolean;
  /** The day being collected, so a pending day can be claimed out of order. */
  onClaim: (day: number) => void;
  onClose?: () => void;
}

enum Status {
  Done = 'done',
  /** Read on an earlier day, still uncollected. Claimable, but not today. */
  Pending = 'pending',
  Today = 'today',
  Upcoming = 'upcoming',
}

const statusOf = (
  index: number,
  day: number,
  pendingDays: number[] = [],
): Status => {
  if (index < day - 1) {
    return pendingDays.includes(index + 1) ? Status.Pending : Status.Done;
  }

  return index === day - 1 ? Status.Today : Status.Upcoming;
};

const balancesFor = (day: number, phase: Phase, pendingDays: number[] = []) => {
  const collected = weekPlan.filter(
    (planned) =>
      (planned.day < day && !pendingDays.includes(planned.day)) ||
      (planned.day === day && phase === Phase.Claimed),
  );

  return {
    cores: collected.reduce((sum, planned) => sum + planned.cores, 0),
    freezes: collected.reduce(
      (sum, planned) => sum + (planned.freezeDays ?? 0),
      0,
    ),
  };
};

const rewardLabel = (planned: PlannedDay): string =>
  planned.kind === GiftKind.Cores
    ? `${planned.amount} Cores`
    : `${planned.amount} ${planned.unit.toLowerCase()}`;

const amountText = (planned: PlannedDay): string =>
  planned.kind === GiftKind.Cores ? planned.amount : `${planned.amount} freeze`;

const RULE = 'Read one post a day to unlock that day’s reward.';

/**
 * The one moment the header is allowed to change.
 *
 * The title and the rule are fixed everywhere else on purpose — a header that
 * rewords itself across seven days teaches seven rules. The finale earns the
 * exception: once the last reward is collected there is no rule left to state,
 * and a card that still says "read one post a day to unlock" over a complete
 * week is talking past the person who just finished it.
 */
const FINALE_TITLE = 'Week complete!';
const FINALE_RULE =
  'Seven reading days, seven rewards. Your streak carries on from here.';

const HAIRLINE = 'rgba(168,179,206,0.12)';

const emberBackground =
  'radial-gradient(120% 100% at 20% 0%, rgba(236,82,122,0.34) 0%, rgba(236,82,122,0.16) 42%, rgba(15,18,24,0) 78%), linear-gradient(160deg, rgba(177,75,215,0.16) 0%, rgba(15,18,24,0) 60%)';

/**
 * The card's own motion and the cast's breakpoint.
 *
 * The cast rule is a plain media query on purpose: the theme's `screens`
 * include a raw (pointer) entry, which turns off Tailwind's `min-[…]`
 * arbitrary variants, so `min-[1120px]:block` silently never compiles.
 */
const CardStyles = (): ReactElement => (
  <style>
    {`
      @keyframes zdEmber {
        0% { opacity: 0; transform: translateY(0) scale(0.4); }
        25% { opacity: 1; transform: translateY(-0.75rem) scale(1); }
        100% { opacity: 0; transform: translateY(-2.5rem) scale(0.4); }
      }
      .zd-ember {
        opacity: 0;
        animation: zdEmber var(--zd-duration, 1.8s) ease-out var(--zd-delay, 0ms) infinite both;
      }
      @keyframes zdConfetti {
        0% { opacity: 0; transform: translate3d(0, -20%, 0) rotate(0deg); }
        8% { opacity: 1; }
        100% {
          opacity: 0;
          transform: translate3d(var(--zd-drift, 0), 115%, 0) rotate(var(--zd-spin, 360deg));
        }
      }
      .zd-confetti {
        animation: zdConfetti var(--zd-duration, 2.6s) ease-in var(--zd-delay, 0ms) 1 both;
      }
      .zd-cast { display: none; }
      @media (min-width: 70rem) { .zd-cast { display: block; } }
      @media (prefers-reduced-motion: reduce) {
        .zd-ember { animation: none; }
        /* A burst that cannot move is just litter on the card. */
        .zd-confetti { display: none; }
      }
    `}
  </style>
);

// Seeded so the embers land in the same place on every render.
const seeded = (seed: number): number => {
  const value = Math.sin(seed * 9301 + 49297) * 49297;

  return value - Math.floor(value);
};

const EMBER_COLORS = [
  'rgba(236, 82, 122, 0.9)',
  'rgba(255, 116, 84, 0.85)',
  'rgba(248, 103, 137, 0.85)',
  'rgba(255, 255, 255, 0.6)',
];

/**
 * The reading streak's own mark with a warm glow and, while the streak is lit
 * for today, embers rising off it — the card's one ambient motion.
 */
const StreakFlame = ({
  sizeClass,
  embers,
  glow = true,
  className,
}: {
  sizeClass: string;
  embers?: boolean;
  glow?: boolean;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex shrink-0 items-center justify-center',
      sizeClass,
      className,
    )}
  >
    {glow && (
      <span
        aria-hidden
        className="absolute -inset-4 rounded-full opacity-70 blur-xl"
        style={{
          background:
            'radial-gradient(circle, rgba(236,82,122,0.55) 0%, rgba(177,75,215,0.22) 50%, transparent 72%)',
        }}
      />
    )}
    {embers &&
      Array.from({ length: 9 }, (_, index) => (
        <span
          // Positions of a fixed set: the index is their only identity.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          aria-hidden
          className="zd-ember pointer-events-none absolute rounded-full"
          style={
            {
              left: `${10 + seeded(index * 7) * 80}%`,
              top: `${5 + seeded(index * 13) * 60}%`,
              width: 3 + seeded(index * 3) * 5,
              height: 3 + seeded(index * 3) * 5,
              background: EMBER_COLORS[index % EMBER_COLORS.length],
              '--zd-delay': `${seeded(index * 5) * 1400}ms`,
              '--zd-duration': `${1.4 + seeded(index * 11) * 1.4}s`,
            } as CSSProperties
          }
        />
      ))}
    <ReadingStreakIcon
      secondary
      aria-hidden
      className="relative !h-full !w-full"
      style={{ filter: 'drop-shadow(0 6px 18px rgba(236,82,122,0.45))' }}
    />
  </span>
);

/**
 * The finale's one-off burst, over the card for a couple of seconds.
 *
 * Hand-rolled for the same reason the embers are: the product's confetti lives
 * inside the upvote animation and is not separable. Seeded, so it falls the
 * same way on every render, and it runs ONCE — a celebration that loops is a
 * background.
 */
const Confetti = (): ReactElement => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-0 z-2 overflow-hidden rounded-24"
  >
    {Array.from({ length: 36 }, (_, index) => (
      <span
        // A fixed set: the index is their only identity.
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="zd-confetti absolute block"
        style={
          {
            left: `${seeded(index * 17) * 100}%`,
            top: `-${4 + seeded(index * 29) * 8}%`,
            width: 5 + seeded(index * 3) * 5,
            height: 8 + seeded(index * 7) * 8,
            borderRadius: seeded(index * 23) > 0.6 ? '999px' : '2px',
            background: EMBER_COLORS[index % EMBER_COLORS.length],
            '--zd-delay': `${seeded(index * 11) * 900}ms`,
            '--zd-duration': `${2 + seeded(index * 13) * 1.6}s`,
            '--zd-drift': `${(seeded(index * 19) - 0.5) * 120}px`,
            '--zd-spin': `${180 + seeded(index * 31) * 540}deg`,
          } as CSSProperties
        }
      />
    ))}
  </span>
);

const CheckBadge = ({ className }: { className?: string }): ReactElement => (
  <span
    className={classNames(
      'flex items-center justify-center rounded-full bg-accent-bacon-default text-white',
      className,
    )}
  >
    <VIcon size={IconSize.XXSmall} secondary aria-hidden />
  </span>
);

/**
 * What the two balances actually are.
 *
 * Both words are product vocabulary a first-week account has not met yet, and
 * the chips are the first place either appears. A reward nobody understands
 * cannot pull anyone back, so the definition has to be reachable — on hover
 * where there is a pointer, on press where there is not.
 */
const EXPLAINERS = {
  cores: {
    title: 'Cores',
    body: "daily.dev's currency. Spend them on Awards for posts and comments you rate, or on a briefing.",
    accent: ARCADE.gold,
  },
  freeze: {
    title: 'Streak freeze',
    body: 'Covers a day you miss. It is spent automatically, so the streak survives and carries on.',
    accent: ARCADE.cyan,
  },
} as const;

type ExplainerKey = keyof typeof EXPLAINERS;

/** Long enough to ignore a cursor passing through, short enough to feel instant. */
const EXPLAINER_DELAY_MS = 200;

const BalanceChips = ({
  cores,
  freezes,
}: {
  cores: number;
  freezes: number;
}): ReactElement => {
  const [explainer, setExplainer] = useState<ExplainerKey | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Open on hover after a beat, close the moment the pointer leaves. The delay
  // is what stops the panel flashing at anyone whose cursor merely crosses the
  // chips on its way somewhere else. Click is not a fallback but a requirement:
  // hover does not exist on touch, and this is the first place either word
  // appears.
  const explainerProps = (key: ExplainerKey) => ({
    onMouseEnter: () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => setExplainer(key),
        EXPLAINER_DELAY_MS,
      );
    },
    onMouseLeave: () => {
      window.clearTimeout(timer.current);
      setExplainer(null);
    },
    onClick: () => {
      window.clearTimeout(timer.current);
      setExplainer((open) => (open === key ? null : key));
    },
    onFocus: () => setExplainer(key),
    onBlur: () => setExplainer(null),
  });

  const chip =
    'flex cursor-help items-center gap-1.5 rounded-10 px-2 py-1 font-bold tabular-nums typo-callout';

  return (
    <div className="relative flex items-center gap-2">
      {/* The claim animation flies Cores to this element — keep it single. */}
      <button
        type="button"
        data-reward-target={QuestRewardType.Cores}
        aria-label={`Cores: ${cores}`}
        aria-expanded={explainer === 'cores'}
        {...explainerProps('cores')}
        className={chip}
        style={{
          background: `${ARCADE.ink}CC`,
          border: `0.0625rem solid ${ARCADE.gold}55`,
          color: ARCADE.gold,
        }}
      >
        <CoreIcon size={IconSize.Size16} />
        {cores}
      </button>
      <button
        type="button"
        aria-label={`Streak freezes: ${freezes}`}
        aria-expanded={explainer === 'freeze'}
        {...explainerProps('freeze')}
        className={chip}
        style={{
          background: `${ARCADE.ink}CC`,
          border: `0.0625rem solid ${ARCADE.cyan}55`,
          color: ARCADE.cyan,
        }}
      >
        <FreezeArt sizeClass="size-4" />
        {freezes}
      </button>

      {explainer && (
        // Anchored to the chips rather than portalled. A portalled overlay
        // inside a modal has to stopPropagation or the parent's outside-click
        // handler closes the whole thing — see `drawers/Drawer.tsx`. Staying in
        // the tree avoids that. It opens DOWNWARD because the chips are in the
        // header; above them it would fall outside the card, which clips.
        <div
          className="absolute right-0 top-full z-3 mt-2 w-60 rounded-12 p-3 text-left"
          style={{
            background: ARCADE.ink,
            border: `0.0625rem solid ${EXPLAINERS[explainer].accent}55`,
            boxShadow: '0 0.75rem 2rem rgb(0 0 0 / 0.6)',
          }}
        >
          <p
            className="font-bold uppercase tracking-widest typo-callout"
            style={{ color: EXPLAINERS[explainer].accent }}
          >
            {EXPLAINERS[explainer].title}
          </p>
          <p
            className="mt-1 typo-callout"
            style={{ color: `${ARCADE.ink100}CC` }}
          >
            {EXPLAINERS[explainer].body}
          </p>
        </div>
      )}
    </div>
  );
};

/* -------------------------------- day slot -------------------------------- */

const slotBase =
  'flex h-8 w-full items-center justify-center gap-1 whitespace-nowrap rounded-10 px-1 font-bold tabular-nums typo-footnote';

/**
 * The label that is also the claim. One box in every state, so it can never
 * change a tile's height: the claim on today, a tick on read days, a dashed
 * slot before reading, a lock ahead.
 */
const DaySlot = ({
  planned,
  status,
  phase,
  isClaiming,
  onClaim,
}: {
  planned: PlannedDay;
  status: Status;
  phase: Phase;
  isClaiming?: boolean;
  onClaim: (day: number) => void;
}): ReactElement => {
  const isToday = status === Status.Today;
  const done = status === Status.Done || (isToday && phase === Phase.Claimed);

  if ((isToday && phase === Phase.Ready) || status === Status.Pending) {
    return (
      <button
        type="button"
        onClick={() => onClaim(planned.day)}
        disabled={isClaiming}
        className={classNames(
          slotBase,
          'text-white transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0.5',
        )}
        style={{
          background:
            'linear-gradient(180deg, var(--theme-accent-bacon-subtler), var(--theme-accent-bacon-bolder))',
        }}
      >
        {isClaiming ? 'Claiming…' : 'Claim'}
      </button>
    );
  }

  if (done) {
    return (
      <span
        className={slotBase}
        style={{
          background: isToday ? `${ARCADE.streak}40` : `${ARCADE.streak}1F`,
          color: isToday ? ARCADE.ink100 : ARCADE.streak,
        }}
      >
        <VIcon secondary size={IconSize.Size16} aria-hidden />
        Day {planned.day}
      </span>
    );
  }

  if (isToday) {
    return (
      <span
        className={slotBase}
        style={{
          border: `0.0625rem dashed ${ARCADE.streak}`,
          color: ARCADE.ink100,
        }}
      >
        <ReadingStreakIcon size={IconSize.Size16} aria-hidden />
        Day {planned.day}
      </span>
    );
  }

  return (
    <span
      className={slotBase}
      style={{ background: 'rgba(168,179,206,0.08)', color: ARCADE.ink50 }}
    >
      <LockIcon size={IconSize.Size16} aria-hidden />
      Day {planned.day}
    </span>
  );
};

/* ---------------------------------- tile ---------------------------------- */

/**
 * One day. A scroll-row tile on a phone, a grid cell from tablet up, and the
 * same 160px tall in every state.
 *
 * Read days are quiet — a neutral frame, a small flame and what they paid —
 * so today, the only saturated tile, is where the eye lands.
 */
const Tile = ({
  planned,
  index,
  day,
  phase,
  pendingDays,
  isClaiming,
  onClaim,
  innerRef,
}: {
  planned: PlannedDay;
  index: number;
  day: number;
  phase: Phase;
  pendingDays?: number[];
  isClaiming?: boolean;
  onClaim: (day: number) => void;
  innerRef?: Ref<HTMLLIElement>;
}): ReactElement => {
  const status = statusOf(index, day, pendingDays);
  const isToday = status === Status.Today;
  const done = status === Status.Done || (isToday && phase === Phase.Claimed);
  const quiet = done && !isToday;

  let background = 'rgba(168,179,206,0.06)';
  let border = '0.0625rem solid rgba(168,179,206,0.2)';

  if (isToday) {
    background = `linear-gradient(180deg, ${ARCADE.streak}38, ${ARCADE.streak}10)`;
    border = `0.125rem solid ${ARCADE.streak}`;
  } else if (quiet) {
    background = 'rgba(168,179,206,0.03)';
    border = `0.0625rem solid ${HAIRLINE}`;
  }

  let amountColor: string = ARCADE.cyan;

  if (done) {
    amountColor = ARCADE.ink50;
  } else if (planned.kind === GiftKind.Cores) {
    amountColor = ARCADE.gold;
  }

  let stateLabel = 'upcoming';

  if (done) {
    stateLabel = 'claimed';
  } else if (isToday) {
    stateLabel = 'today';
  } else if (status === Status.Pending) {
    stateLabel = 'ready to claim';
  }

  return (
    <li
      ref={innerRef}
      aria-label={`Day ${planned.day}, ${stateLabel}, ${rewardLabel(planned)}`}
      className="relative flex h-40 w-[5.75rem] snap-center flex-col items-center justify-between gap-2 rounded-16 p-2 tablet:w-auto tablet:p-1.5 laptop:p-2"
      style={{ background, border }}
    >
      {/* What the reward actually is, on hover. Every name on this ladder is
          product vocabulary a first-week account has not met — "Cores", "streak
          freeze" — and the tile has room for the amount and nothing else, so
          the explanation has to live somewhere. `enableMobileClick` because
          hover does not exist on touch. */}
      <Tooltip side="top" content={planned.explainer} enableMobileClick>
        <span className="flex flex-1 cursor-help flex-col items-center justify-center gap-1">
          <span className="relative flex size-14 items-center justify-center">
            {done ? (
              <>
                <StreakFlame
                  sizeClass={quiet ? 'size-8' : 'size-10'}
                  glow={isToday}
                  className={quiet ? 'opacity-70' : undefined}
                />
                <CheckBadge
                  className={classNames(
                    'absolute ring-2 ring-[#181E25]',
                    quiet
                      ? 'bottom-2 right-2 size-4'
                      : '-bottom-0.5 -right-0.5 size-5',
                  )}
                />
              </>
            ) : (
              <span className="flex items-center justify-center">
                {planned.kind === GiftKind.Cores ? (
                  <CoreArt cores={planned.cores} sizeClass="size-12" />
                ) : (
                  <FreezeArt sizeClass="size-12" />
                )}
              </span>
            )}
          </span>
          <span
            className="whitespace-nowrap font-bold tabular-nums typo-footnote"
            style={{ color: amountColor }}
          >
            {done
              ? amountText(planned).replace(/^\+?/, '+')
              : amountText(planned)}
          </span>
        </span>
      </Tooltip>
      <DaySlot
        planned={planned}
        status={status}
        phase={phase}
        isClaiming={isClaiming}
        onClaim={onClaim}
      />
    </li>
  );
};

/* ---------------------------------- card ---------------------------------- */

export const WeeklyRewardsModal = ({
  day,
  phase,
  streakDays,
  pendingDays,
  isClaiming,
  onClaim,
  onClose,
}: WeeklyRewardsModalProps): ReactElement => {
  const todayRef = useRef<HTMLLIElement | null>(null);
  // Keyed by day as well as today's own ref: more than one tile can be
  // pressed now, and the Cores fly out of whichever one it was.
  const tileRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const rowRef = useRef<HTMLOListElement>(null);
  const timers = useRef<number[]>([]);
  const [flights, setFlights] = useState<QuestRewardFlight[]>([]);
  const initial = balancesFor(day, phase, pendingDays);
  const [cores, setCores] = useState(initial.cores);
  const [freezes, setFreezes] = useState(initial.freezes);
  const [pushOn, setPushOn] = useState(false);
  const [claimedHere, setClaimedHere] = useState(false);
  // Separate from `claimedHere`, which any claim sets: a pending day collected
  // from day 7 is not the finale, and must not fire the celebration.
  const [finaleClaimed, setFinaleClaimed] = useState(false);
  const clearFlights = useCallback(() => setFlights([]), []);
  const today = weekPlan[day - 1];
  const lit = phase !== Phase.Unread;
  // The run is finished: the last day's reward is in. Either it was collected
  // before this card opened, or it was just pressed here.
  const complete =
    day === FINAL_DAY && (phase === Phase.Claimed || finaleClaimed);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // A copy that did not run the claim itself follows the day and state it is
  // handed; the one that did keeps counting up as its Cores land.
  useEffect(() => {
    if (claimedHere) {
      return;
    }

    const next = balancesFor(day, phase, pendingDays);
    setCores(next.cores);
    setFreezes(next.freezes + (pushOn ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, phase]);

  // On a phone the row scrolls: park it on today — on open, and again when
  // the viewport changes (a rotation, or a tablet window crossing 656px).
  useEffect(() => {
    const park = () => {
      const row = rowRef.current;
      const tile = todayRef.current;

      if (row && tile && row.scrollWidth > row.clientWidth) {
        row.scrollLeft =
          tile.offsetLeft - (row.clientWidth - tile.clientWidth) / 2;
      }
    };

    park();
    window.addEventListener('resize', park);

    return () => window.removeEventListener('resize', park);
  }, [day]);

  // The production claim animation, flying from today's tile to the balance.
  const handleClaim = useCallback(
    (claimDay: number) => {
      onClaim(claimDay);
      setClaimedHere(true);

      if (claimDay === FINAL_DAY) {
        setFinaleClaimed(true);
      }

      const claimed = weekPlan[claimDay - 1];

      if (claimed?.freezeDays) {
        setFreezes((current) => current + (claimed.freezeDays ?? 0));
      }

      const tile = tileRefs.current[claimDay];
      const amountDue = claimed?.cores ?? 0;

      if (!tile || !amountDue) {
        return;
      }

      const rect = tile.getBoundingClientRect();
      const built = buildQuestRewardFlights([
        {
          id: `zd-weekly-${claimDay}`,
          type: QuestRewardType.Cores,
          amount: amountDue,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
      ]);
      setFlights(built);

      const share = Math.round(amountDue / built.length);
      built.forEach((flight, index) => {
        const amount =
          index === built.length - 1 ? amountDue - share * index : share;
        timers.current.push(
          window.setTimeout(
            () => setCores((current) => current + amount),
            getQuestRewardHitAt(flight.delayMs),
          ),
        );
      });
    },
    [onClaim],
  );

  // Credited when push actually turns on; production must wait for the
  // browser's `granted`, or a denial still pays out.
  const onTogglePush = () => {
    setFreezes((current) => current + (pushOn ? -1 : 1));
    setPushOn(!pushOn);
  };

  return (
    <div className="relative w-full shrink-0 tablet:max-w-[52rem]">
      <CardStyles />
      <div
        // On a short phone the sheet scrolls inside itself rather than
        // running off the bottom of the screen.
        className="relative max-h-[92dvh] overflow-y-auto rounded-t-24 border border-border-subtlest-secondary [scrollbar-width:none] tablet:max-h-none tablet:overflow-hidden tablet:rounded-24"
        style={{ background: ARCADE.surface }}
      >
        {/* Over the whole card, and only when the week is finished. */}
        {complete && <Confetti />}

        {/* A bottom sheet on a phone says so with a grab handle. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-2 z-1 h-1 w-10 -translate-x-1/2 rounded-full tablet:hidden"
          style={{ background: 'rgba(168,179,206,0.35)' }}
        />

        {/* One grid, three arrangements, every element rendered once — the
            balance is the claim animation's landing target, so it cannot be
            duplicated per breakpoint. Under 420px: streak, title, balance
            stacked. Phone: streak and balance share the top row. Tablet up:
            streak | divider | title | balance. */}
        <div
          className="grid grid-cols-1 items-center gap-x-5 gap-y-3 px-5 pb-5 pt-5 [grid-template-areas:'streak'_'title'_'balance'] mobileL:grid-cols-[auto_1fr_auto] mobileL:[grid-template-areas:'streak_._balance'_'title_title_title'] tablet:grid-cols-[auto_auto_minmax(0,1fr)_auto] tablet:px-7 tablet:pb-6 tablet:pt-7 tablet:[grid-template-areas:'streak_divider_title_balance']"
          style={{ background: emberBackground }}
        >
          {/* The streak as a stat lockup, the way the app's streak button
              pairs the icon with the count. Before today's post is read the
              flame dims and its embers wait. */}
          <div className="flex items-center gap-3 [grid-area:streak]">
            <StreakFlame
              sizeClass="size-14"
              embers={lit}
              glow={lit}
              className={classNames(
                'transition-opacity duration-500',
                !lit && 'opacity-40',
              )}
            />
            <span className="flex flex-col">
              <span
                className="font-bold tabular-nums leading-none typo-title1"
                style={{ color: ARCADE.ink100 }}
              >
                {streakDays}
              </span>
              <span
                className="mt-0.5 typo-caption1"
                style={{ color: ARCADE.ink70 }}
              >
                day streak
              </span>
            </span>
          </div>

          <span
            aria-hidden
            className="hidden h-12 w-px [grid-area:divider] tablet:block"
            style={{ background: 'rgba(168,179,206,0.2)' }}
          />

          <div className="flex min-w-0 flex-col gap-1 [grid-area:title]">
            <h2
              className="text-balance font-bold typo-title3"
              style={{ color: ARCADE.ink100 }}
            >
              {complete ? FINALE_TITLE : 'Weekly reading rewards'}
            </h2>
            <p
              className="text-pretty typo-footnote"
              style={{ color: ARCADE.ink70 }}
            >
              {complete ? FINALE_RULE : RULE}
            </p>
          </div>

          <div className="justify-self-start [grid-area:balance] mobileL:self-start mobileL:justify-self-end mobileL:pr-10 tablet:pr-9">
            <BalanceChips cores={cores} freezes={freezes} />
          </div>
        </div>

        <ol
          ref={rowRef}
          className="flex snap-x gap-2 overflow-x-auto px-5 py-5 [scrollbar-width:none] tablet:grid tablet:grid-cols-7 tablet:gap-1.5 tablet:overflow-visible tablet:px-5 tablet:py-6 laptop:gap-2 laptop:px-6"
        >
          {weekPlan.map((planned, index) => (
            <Tile
              key={planned.day}
              planned={planned}
              index={index}
              day={day}
              phase={phase}
              pendingDays={pendingDays}
              isClaiming={isClaiming}
              onClaim={handleClaim}
              innerRef={(node) => {
                tileRefs.current[planned.day] = node;

                if (index === day - 1) {
                  todayRef.current = node;
                }
              }}
            />
          ))}
        </ol>

        {/* One ask, centred between the cast. A button rather than a switch:
            the freeze is redeemed once, it is not a setting. */}
        {day < FINAL_DAY && (
          <div
            className="flex items-center justify-center border-t px-5 pb-6 pt-4 tablet:h-[4.5rem] tablet:px-16 tablet:py-0"
            style={{ borderColor: HAIRLINE }}
          >
            <span className="flex w-full flex-col items-stretch gap-3 tablet:w-auto tablet:flex-row tablet:items-center">
              <span className="flex items-center gap-3">
                <FreezeArt sizeClass="size-7" />
                <span className="flex flex-col">
                  <span
                    className="font-bold typo-footnote"
                    style={{ color: ARCADE.ink100 }}
                  >
                    {pushOn ? '+1 streak freeze added' : 'Get +1 streak freeze'}
                  </span>
                  <span
                    className="typo-caption1"
                    style={{ color: ARCADE.ink50 }}
                  >
                    {pushOn
                      ? 'Reminders are on'
                      : 'For turning on reading reminders'}
                  </span>
                </span>
              </span>
              {!pushOn && (
                <button
                  type="button"
                  onClick={onTogglePush}
                  className="h-10 w-full rounded-10 px-3.5 font-bold typo-footnote transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white tablet:ml-1 tablet:h-8 tablet:w-auto"
                  style={{ color: ARCADE.ink, background: ARCADE.ink100 }}
                >
                  Turn on notifications
                </button>
              )}
            </span>
          </div>
        )}

        {/* A sheet on a phone closes with a full-width button at the bottom,
            where the thumb is — not with a 24px target in the far corner. The
            X is the tablet-and-up affordance, so each size gets exactly one. */}
        <CloseButton
          size={ButtonSize.Small}
          className="absolute right-3 top-3 z-2 hidden text-white tablet:flex"
          onClick={onClose}
        />

        <div
          className="border-t px-5 pb-6 pt-4 tablet:hidden"
          style={{ borderColor: HAIRLINE }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-12 font-bold typo-callout"
            style={{
              background: 'rgba(168,179,206,0.12)',
              color: ARCADE.ink100,
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* The cast overlaps the card by ~45px, with 80% of each body level with
          it, and only where there is room beside the card (1120px up). */}
      <img
        src="/zero-day-boy.png"
        alt=""
        aria-hidden
        className="zd-cast pointer-events-none absolute -bottom-[2.6rem] -left-[6.1rem] z-10 h-52 w-auto select-none"
      />
      <img
        src="/zero-day-dog.png"
        alt=""
        aria-hidden
        className="zd-cast pointer-events-none absolute -bottom-[2.4rem] -right-[6.9rem] z-10 h-48 w-auto select-none"
      />
      <QuestRewardFlightLayer flights={flights} onDone={clearFlights} />
    </div>
  );
};
