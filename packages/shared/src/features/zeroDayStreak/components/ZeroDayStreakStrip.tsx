import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { CoreIcon, GiftIcon, LockIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { webappUrl } from '../../../lib/constants';
import { useZeroDayStreak } from '../hooks/useZeroDayStreak';
import type { ZeroDayBrief } from '../lib/zeroDayStreak';
import {
  ZERO_DAY_BRIEF_UNLOCK_DAY,
  ZERO_DAY_STREAK_LENGTH,
  ZeroDayCellState,
} from '../lib/zeroDayStreak';

const cellStateClass: Record<ZeroDayCellState, string> = {
  // Claimed days fill in the Cores colour — this is a claim streak, not the
  // reading streak, so it deliberately doesn't borrow the pink flame disc.
  [ZeroDayCellState.Claimed]: 'border-transparent bg-accent-cheese-default',
  [ZeroDayCellState.Today]: 'border-transparent',
  // Untouched days are data, not chrome, so they take the same `quaternary`
  // outline the 30-day reading calendar uses rather than a subtle border.
  [ZeroDayCellState.Upcoming]: 'border-text-quaternary',
};

const ZeroDayCell = ({
  state,
  isClaimed,
}: {
  state: ZeroDayCellState;
  isClaimed: boolean;
}): ReactElement => {
  const isToday = state === ZeroDayCellState.Today;
  const showCore = state === ZeroDayCellState.Claimed || isClaimed;

  return (
    <li
      className={classNames(
        'relative flex size-8 items-center justify-center rounded-full border',
        showCore
          ? cellStateClass[ZeroDayCellState.Claimed]
          : cellStateClass[state],
      )}
    >
      {showCore && (
        // Dark ink rather than white: the cheese disc is the same yellow in both
        // themes, and a white tick on it is barely there in either.
        <VIcon
          secondary
          size={IconSize.XSmall}
          className="text-raw-pepper-90"
        />
      )}
      {isToday && !showCore && (
        // Still, not pulsing: `scale-down-pulse` drops to half opacity for half
        // its cycle, so it would leave today's cell dimmer than the days around
        // it as often as not. The today ring already marks it.
        <GiftIcon size={IconSize.XSmall} className="text-text-primary" />
      )}
      {isToday && (
        // Today's ring sits on top so it stays legible over a filled cell —
        // same treatment as the reading calendar's today marker. It follows the
        // tick's ink on a claimed day, because the theme's own `text-primary` is
        // white in dark mode and all but disappears against the cheese disc.
        <span
          aria-hidden
          className={classNames(
            'pointer-events-none absolute inset-0 z-1 rounded-full ring-1',
            showCore ? 'ring-raw-pepper-90' : 'ring-text-primary',
          )}
        />
      )}
    </li>
  );
};

const ZeroDayBriefRow = ({
  isUnlocked,
  daysToUnlock,
  price,
  balance,
  canAfford,
}: ZeroDayBrief): ReactElement => {
  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-2">
        <LockIcon size={IconSize.XSmall} className="text-text-quaternary" />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Briefing unlocks on day {ZERO_DAY_BRIEF_UNLOCK_DAY} · {daysToUnlock}{' '}
          {daysToUnlock === 1 ? 'day' : 'days'} to go
        </Typography>
      </div>
    );
  }

  return (
    <Link href={`${webappUrl}briefing/generate`} passHref>
      <a className="focus-outline flex items-center gap-2 rounded-8 hover:underline">
        <CoreIcon size={IconSize.XSmall} className="shrink-0" />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          bold
        >
          {canAfford
            ? 'Your Cores cover a briefing'
            : `${price - balance} more Cores for a briefing`}
        </Typography>
      </a>
    </Link>
  );
};

export interface ZeroDayStreakStripViewProps {
  week: ZeroDayCellState[];
  day: number;
  canClaim: boolean;
  claimedToday: boolean;
  isClaiming: boolean;
  /** Cores the claim just paid out, or null when it happened before this visit. */
  revealedCores: number | null;
  onClaim: () => void;
  brief: ZeroDayBrief;
}

// Presentational — the data hooks live in ZeroDayStreakStrip, so the Storybook
// state matrix can render the real thing.
export const ZeroDayStreakStripView = ({
  week,
  day,
  canClaim,
  claimedToday,
  isClaiming,
  revealedCores,
  onClaim,
  brief,
}: ZeroDayStreakStripViewProps): ReactElement => (
  <section
    aria-label="Your first week"
    className="flex flex-col gap-3 rounded-10 bg-surface-float px-3 py-3"
  >
    <div className="flex items-baseline justify-between gap-2">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Primary}
        bold
      >
        Day {day} of {ZERO_DAY_STREAK_LENGTH}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Your first week
      </Typography>
    </div>

    <ol className="flex items-center justify-between">
      {week.map((state, index) => (
        <ZeroDayCell
          // Position in the run is the identity here — there are no per-day
          // records to key on.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          state={state}
          isClaimed={state === ZeroDayCellState.Today && claimedToday}
        />
      ))}
    </ol>

    {canClaim && (
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<GiftIcon secondary />}
        loading={isClaiming}
        onClick={onClaim}
      >
        Open today&apos;s gift
      </Button>
    )}

    {!canClaim && claimedToday && (
      <div className="flex items-center gap-1.5 motion-safe:animate-image-zoom-in">
        <CoreIcon size={IconSize.XSmall} className="shrink-0" />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          bold
          className="tabular-nums"
        >
          {revealedCores !== null
            ? `You got ${revealedCores} Cores`
            : "Today's gift is open"}
        </Typography>
      </div>
    )}

    {!canClaim && !claimedToday && (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Read a post to open today&apos;s gift.
      </Typography>
    )}

    <ZeroDayBriefRow {...brief} />
  </section>
);

// The zero-day claim strip: one week, one concealed claim a day. The amount is
// hidden until the claim resolves on purpose — "see what you got" is the point,
// and a visible "+30 Cores" turns the whole thing back into a points balance.
export const ZeroDayStreakStrip = (): ReactElement | null => {
  const {
    isEnrolled,
    week,
    day,
    claimableQuests,
    claimedToday,
    isClaiming,
    claimToday,
    brief,
  } = useZeroDayStreak();
  const [revealedCores, setRevealedCores] = useState<number | null>(null);

  if (!isEnrolled) {
    return null;
  }

  return (
    <ZeroDayStreakStripView
      week={week}
      day={day}
      canClaim={claimableQuests.length > 0 && !claimedToday}
      claimedToday={claimedToday}
      isClaiming={isClaiming}
      revealedCores={revealedCores}
      onClaim={async () => setRevealedCores(await claimToday())}
      brief={brief}
    />
  );
};
