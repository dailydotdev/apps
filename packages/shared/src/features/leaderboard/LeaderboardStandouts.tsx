import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { ProfileTooltip } from '../../components/profile/ProfileTooltip';
import Link from '../../components/utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import type { UserLeaderboard } from '../../graphql/leaderboard';
import { LeaderboardType } from '../../graphql/leaderboard';
import { formatLeaderboardScoreWithUnit, LEADERBOARD_BOARDS } from './boards';
import { LeaderboardHeading } from './LeaderboardRows';
import { leaderboardUserClickEvent } from './leaderboardLog';
import {
  LeaderboardLevel,
  LeaderboardReputation,
  LeaderboardStreak,
} from './LeaderboardScore';

const standoutStat = (
  type: LeaderboardType,
  entry: UserLeaderboard,
): ReactNode => {
  if (type === LeaderboardType.HighestLevel && entry.level) {
    return <LeaderboardLevel level={entry.level} label />;
  }
  if (type === LeaderboardType.HighestReputation) {
    return (
      <LeaderboardReputation
        value={entry.score}
        className="justify-center !typo-caption1"
      />
    );
  }
  if (type === LeaderboardType.LongestStreak) {
    return (
      <LeaderboardStreak
        days={entry.score}
        className="justify-center !typo-caption1"
      />
    );
  }

  return formatLeaderboardScoreWithUnit(type, entry.score);
};

interface LeaderboardStandoutsProps {
  getBoard: (type: LeaderboardType) => UserLeaderboard[];
}

/** The #1 of every people board, in a row you scroll sideways on phones. */
export const LeaderboardStandouts = ({
  getBoard,
}: LeaderboardStandoutsProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const standouts = LEADERBOARD_BOARDS.flatMap((board) => {
    const [top] = getBoard(board.type);

    return top ? [{ board, top }] : [];
  });

  if (standouts.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <LeaderboardHeading title="Standouts" />
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 tablet:mx-0 tablet:px-0">
        {standouts.map(({ board, top }) => (
          <li key={board.type} className="flex w-40 shrink-0">
            <Link href={top.user.permalink} passHref prefetch={false}>
              <a
                href={top.user.permalink}
                className="flex w-full flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary p-3 text-center hover:border-border-subtlest-secondary"
                onClick={() =>
                  logEvent(
                    leaderboardUserClickEvent({
                      userId: top.user.id,
                      placement: 'standouts',
                      board: board.type,
                      rank: 1,
                    }),
                  )
                }
              >
                <span className="w-full truncate font-bold uppercase tracking-wide text-text-primary typo-caption2">
                  {board.eyebrow}
                </span>
                <ProfileTooltip userId={top.user.id} initialUser={top.user}>
                  <span className="flex shrink-0">
                    <ProfilePicture
                      user={top.user}
                      size={ProfileImageSize.XLarge}
                      nativeLazyLoading
                    />
                  </span>
                </ProfileTooltip>
                <span className="flex w-full min-w-0 flex-col">
                  <span className="truncate font-bold typo-footnote">
                    {top.user.name}
                  </span>
                  <span className="flex h-4 items-center justify-center truncate text-text-tertiary typo-caption1">
                    {standoutStat(board.type, top)}
                  </span>
                </span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
