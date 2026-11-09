import type { ReactElement } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import type { CompanyLeaderboard } from '../../graphql/leaderboard';
import {
  LeaderboardType,
  leaderboardTypeToTitle,
} from '../../graphql/leaderboard';
import { formatLeaderboardScore, LEADERBOARD_TILE_ROWS } from './boards';
import { LeaderboardBoardTile } from './LeaderboardBoardTile';
import { LeaderboardMiniRow } from './LeaderboardRows';

interface LeaderboardCompanyTileProps {
  items: CompanyLeaderboard[];
}

/**
 * Most verified employees: companies only, so there is no row for you. Your
 * verified company is lit wherever it is on the board, and pinned under the
 * top rows when it is further down.
 */
export const LeaderboardCompanyTile = ({
  items,
}: LeaderboardCompanyTileProps): ReactElement => {
  const { user } = useAuthContext();
  const mine = items.findIndex((item) =>
    user?.companies?.some((company) => company.name === item.company.name),
  );
  const row = (item: CompanyLeaderboard, rank: number) => (
    <LeaderboardMiniRow
      key={item.company.name}
      rank={rank}
      name={item.company.name}
      image={
        <ProfilePicture
          user={{ image: item.company.image, id: item.company.name }}
          size={ProfileImageSize.Small}
          nativeLazyLoading
        />
      }
      value={formatLeaderboardScore(item.score)}
      highlight={rank - 1 === mine}
    />
  );

  return (
    <LeaderboardBoardTile
      type={LeaderboardType.MostVerifiedUsers}
      title={leaderboardTypeToTitle[LeaderboardType.MostVerifiedUsers]}
      items={items}
      renderRow={row}
      you={
        mine >= LEADERBOARD_TILE_ROWS ? row(items[mine], mine + 1) : undefined
      }
    />
  );
};
