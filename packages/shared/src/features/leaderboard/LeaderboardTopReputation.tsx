import type { ReactElement } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { ProfileTooltip } from '../../components/profile/ProfileTooltip';
import { useLogContext } from '../../contexts/LogContext';
import type { UserLeaderboard } from '../../graphql/leaderboard';
import {
  LeaderboardType,
  leaderboardTypeToTitle,
} from '../../graphql/leaderboard';
import { LeaderboardReputation } from './LeaderboardScore';
import {
  leaderboardBoardClickEvent,
  leaderboardUserClickEvent,
} from './leaderboardLog';
import {
  LeaderboardEmptyBoard,
  LeaderboardHeading,
  LeaderboardListRow,
  LeaderboardTextLink,
} from './LeaderboardRows';

const PersonRow = ({
  entry,
  rank,
  onClick,
}: {
  entry: UserLeaderboard;
  rank: number;
  onClick: () => void;
}): ReactElement => (
  <LeaderboardListRow
    rank={rank}
    name={entry.user.name}
    href={entry.user.permalink}
    onClick={onClick}
    image={
      <ProfileTooltip userId={entry.user.id} initialUser={entry.user}>
        <span className="flex shrink-0">
          <ProfilePicture
            user={entry.user}
            size={ProfileImageSize.Medium}
            nativeLazyLoading
          />
        </span>
      </ProfileTooltip>
    }
    value={<LeaderboardReputation value={entry.score} />}
  />
);

/** The top of Highest reputation, in columns, with its full ranking a press away. */
export const LeaderboardTopReputation = ({
  items,
}: {
  items: UserLeaderboard[];
}): ReactElement => {
  const { logEvent } = useLogContext();
  const board = LeaderboardType.HighestReputation;

  return (
    <section className="flex flex-col gap-2">
      <LeaderboardHeading
        title={leaderboardTypeToTitle[board]}
        action={
          <LeaderboardTextLink
            href={`/users/${board}`}
            onClick={() => logEvent(leaderboardBoardClickEvent(board, 'page'))}
          >
            Full ranking
          </LeaderboardTextLink>
        }
      />
      {items.length === 0 ? (
        <LeaderboardEmptyBoard />
      ) : (
        <ol className="grid grid-cols-1 gap-x-8 tablet:grid-flow-col tablet:grid-cols-2 tablet:grid-rows-6 laptop:grid-cols-3 laptop:grid-rows-4">
          {items.map((entry, index) => (
            <PersonRow
              key={entry.user.id}
              entry={entry}
              rank={index + 1}
              onClick={() =>
                logEvent(
                  leaderboardUserClickEvent({
                    userId: entry.user.id,
                    placement: 'top reputation',
                    board,
                    rank: index + 1,
                  }),
                )
              }
            />
          ))}
        </ol>
      )}
    </section>
  );
};
