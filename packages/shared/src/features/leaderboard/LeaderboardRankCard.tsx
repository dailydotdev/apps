import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import { Dropdown } from '../../components/fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import type {
  LeaderboardPosition,
  LeaderboardType,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import {
  leaderboardPositionQueryOptions,
  leaderboardTypeToTitle,
} from '../../graphql/leaderboard';
import { Origin } from '../../lib/log';
import { ProfileSnapshotButton } from '../snapshot/ProfileSnapshotButton';
import {
  formatLeaderboardScore,
  formatLeaderboardScoreWithUnit,
  formatLeaderboardUnit,
  getLeaderboardBoard,
  LEADERBOARD_POSITION_BOARDS,
} from './boards';
import { LeaderboardActionCard } from './LeaderboardActionCard';
import { LeaderboardReputation, LeaderboardStreak } from './LeaderboardScore';
import { youHighlightClassName } from './LeaderboardRows';
import { LeaderboardSnapshotCard } from './LeaderboardSnapshotCard';
import { leaderboardRankPickerEvent } from './leaderboardLog';
import {
  getLeaderboardRankLabel,
  getLeaderboardRankState,
} from './useLeaderboardPosition';

const SNAPSHOT_ROWS = 3;

/**
 * The board you rank best on, so the card opens on your best result. Past
 * the cap or with no score there is no rank to compare: the first board.
 */
const getBestBoard = (
  positions: (LeaderboardPosition | null | undefined)[],
): LeaderboardType => {
  let best = 0;
  let bestRank = Infinity;
  positions.forEach((position, index) => {
    if (position?.rank && position.rank < bestRank) {
      best = index;
      bestRank = position.rank;
    }
  });

  return LEADERBOARD_POSITION_BOARDS[best].type;
};

const pickerOptions = LEADERBOARD_POSITION_BOARDS.map(
  (board) => leaderboardTypeToTitle[board.type],
);

interface LeaderboardRankCardProps {
  /** Each board's top rows, for the snapshot's top 3. */
  getBoard: (type: LeaderboardType) => UserLeaderboard[];
}

export const LeaderboardRankCard = ({
  getBoard,
}: LeaderboardRankCardProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const [picked, setPicked] = useState<LeaderboardType>();
  const positions = useQueries({
    queries: LEADERBOARD_POSITION_BOARDS.map((board) => ({
      ...leaderboardPositionQueryOptions(user, board.type),
      enabled: !!user,
    })),
  });

  if (!user) {
    return null;
  }

  if (positions.some((query) => query.isPending)) {
    return (
      <LeaderboardActionCard
        className={`border-transparent ${youHighlightClassName}`}
        title={<ElementPlaceholder className="h-4 w-40 rounded-4" />}
        detail={<ElementPlaceholder className="mt-1 h-3 w-56 rounded-4" />}
      >
        <ElementPlaceholder className="mt-auto h-9 w-44 rounded-12" />
      </LeaderboardActionCard>
    );
  }

  const board = picked ?? getBestBoard(positions.map((query) => query.data));
  const boardIndex = LEADERBOARD_POSITION_BOARDS.findIndex(
    (item) => item.type === board,
  );
  const position = positions[boardIndex].data;
  const state = getLeaderboardRankState(position);
  const title = leaderboardTypeToTitle[board];
  const score = position?.score ?? 0;

  const headline = ((): string => {
    if (state === 'empty' || !position) {
      return `No rank yet on ${title}`;
    }
    if (state === 'capped') {
      return `You’re outside the top ${formatLeaderboardScore(
        position.cappedAt,
      )}`;
    }

    return `You’re ${getLeaderboardRankLabel(position)} on ${title}`;
  })();

  const detail = ((): ReactNode => {
    if (state === 'empty') {
      return getLeaderboardBoard(board).howTo;
    }
    if (board === 'highestReputation') {
      return (
        <div className="flex items-center gap-1">
          <LeaderboardReputation value={score} large /> reputation in total
        </div>
      );
    }
    if (board === 'longestStreak') {
      return (
        <span className="flex items-center gap-1">
          <LeaderboardStreak days={score} large /> days in a row
        </span>
      );
    }

    return `${formatLeaderboardScoreWithUnit(board, score)} in total`;
  })();

  const heading = (
    <div className="flex items-center gap-3">
      <ProfilePicture user={user} size={ProfileImageSize.XLarge} />
      <div className="flex w-0 min-w-0 flex-1 flex-col gap-0.5">
        <span className="typo-title3">{headline}</span>
        <div className="font-normal text-text-tertiary typo-callout">
          {detail}
        </div>
      </div>
    </div>
  );

  // The profile snapshot flow: the card staged off-screen at its full size,
  // captured, copied, then the snapshot share panel.
  const snapshot = (size: ButtonSize): ReactNode =>
    state === 'empty' || !position ? undefined : (
      <ProfileSnapshotButton
        origin={Origin.Leaderboard}
        filename={`daily-leaderboard-${board}`}
        ownerId={user.id}
        showLabel
        size={size}
        variant={ButtonVariant.Primary}
        renderCard={(ref) => (
          <LeaderboardSnapshotCard
            ref={ref}
            user={{
              name: user.name,
              handle: `@${user.username}`,
              image: user.image,
            }}
            title={title}
            rank={getLeaderboardRankLabel(position)}
            stat={{
              value: formatLeaderboardScore(score),
              label: formatLeaderboardUnit(
                score,
                getLeaderboardBoard(board).unit,
              ),
            }}
            listTitle={`Top ${SNAPSHOT_ROWS} · ${title}`}
            rows={getBoard(board)
              .slice(0, SNAPSHOT_ROWS)
              .map((entry, index) => ({
                rank: index + 1,
                name: entry.user.name,
                value: formatLeaderboardScoreWithUnit(board, entry.score),
              }))}
          />
        )}
      />
    );

  return (
    <LeaderboardActionCard
      className={`border-transparent ${youHighlightClassName}`}
      title={heading}
      aside={
        // Phones: Snapshot shrinks to the picker's line.
        <span className="flex w-full items-center gap-2 laptop:mr-auto laptop:w-auto">
          <Dropdown
            className={{
              container: 'min-w-0 flex-1 laptop:flex-none',
              button:
                'h-9 !rounded-12 border border-border-subtlest-tertiary font-bold !text-text-primary !typo-callout',
              label: 'typo-callout',
            }}
            buttonAriaLabel="Your rank on"
            buttonSize={ButtonSize.Medium}
            buttonVariant={ButtonVariant.Tertiary}
            drawerProps={{ title: 'Your rank on' }}
            options={pickerOptions}
            selectedIndex={boardIndex}
            onChange={(_, index) => {
              const { type } = LEADERBOARD_POSITION_BOARDS[index];
              setPicked(type);
              logEvent(leaderboardRankPickerEvent(type));
            }}
            shouldIndicateSelected
          />
          <span className="flex shrink-0 tablet:hidden">
            {snapshot(ButtonSize.XSmall)}
          </span>
        </span>
      }
      action={snapshot(ButtonSize.Small)}
      actionClassName="hidden tablet:flex"
    />
  );
};
