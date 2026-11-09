import type { ReactElement } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { ProfileTooltip } from '../../components/profile/ProfileTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import type {
  LeaderboardType,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import { leaderboardTypeToTitle } from '../../graphql/leaderboard';
import { LeaderboardBoardTile } from './LeaderboardBoardTile';
import { leaderboardUserClickEvent } from './leaderboardLog';
import { LeaderboardMiniRow } from './LeaderboardRows';
import { LeaderboardScoreValue } from './LeaderboardScore';
import {
  getLeaderboardRankLabel,
  useLeaderboardPosition,
} from './useLeaderboardPosition';

interface LeaderboardUserBoardTileProps {
  type: LeaderboardType;
  items: UserLeaderboard[];
}

export const LeaderboardUserBoardTile = ({
  type,
  items,
}: LeaderboardUserBoardTileProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { position, state } = useLeaderboardPosition(type);
  const you =
    user && position && state !== 'empty' ? (
      <LeaderboardMiniRow
        rank={getLeaderboardRankLabel(position)}
        name="You"
        href={user.permalink}
        onClick={() =>
          logEvent(
            leaderboardUserClickEvent({
              userId: user.id,
              placement: 'board',
              board: type,
              rank: position.rank ?? undefined,
            }),
          )
        }
        image={
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Small}
            nativeLazyLoading
          />
        }
        value={<LeaderboardScoreValue type={type} score={position.score} />}
        highlight
      />
    ) : undefined;

  return (
    <LeaderboardBoardTile
      type={type}
      title={leaderboardTypeToTitle[type]}
      items={items}
      you={you}
      renderRow={(item, rank) => (
        <LeaderboardMiniRow
          key={item.user.id}
          rank={rank}
          name={item.user.name}
          href={item.user.permalink}
          onClick={() =>
            logEvent(
              leaderboardUserClickEvent({
                userId: item.user.id,
                placement: 'board',
                board: type,
                rank,
              }),
            )
          }
          image={
            <ProfileTooltip userId={item.user.id} initialUser={item.user}>
              <span className="flex shrink-0">
                <ProfilePicture
                  user={item.user}
                  size={ProfileImageSize.Small}
                  nativeLazyLoading
                />
              </span>
            </ProfileTooltip>
          }
          value={
            <LeaderboardScoreValue
              type={type}
              score={item.score}
              level={item.level}
            />
          }
        />
      )}
    />
  );
};
