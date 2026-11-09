import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  CompanyLeaderboard,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import { LeaderboardType } from '../../graphql/leaderboard';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';
import { LEADERBOARD_BOARDS } from './boards';
import { LeaderboardCompanyTile } from './LeaderboardCompanyTile';
import { LeaderboardInviteCard } from './LeaderboardInviteCard';
import { LeaderboardRankCard } from './LeaderboardRankCard';
import { LeaderboardHeading } from './LeaderboardRows';
import { LeaderboardStandouts } from './LeaderboardStandouts';
import { LeaderboardTopReputation } from './LeaderboardTopReputation';
import { LeaderboardUserBoardTile } from './LeaderboardUserBoardTile';

export type LeaderboardBoards = Partial<
  Record<LeaderboardType, UserLeaderboard[]>
>;

export interface LeaderboardHubProps {
  /** Each people board's top rows; a board the API lacks is left out. */
  boards: LeaderboardBoards;
  companies: CompanyLeaderboard[];
}

const noItems: UserLeaderboard[] = [];

/** Signed in, the page opens on you: your rank and the Plus invite. */
const ActionRow = ({
  getBoard,
}: {
  getBoard: (type: LeaderboardType) => UserLeaderboard[];
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEligible, isLoading } = useReferralLadder();
  const hasInvite = isEligible || isLoading;

  if (!user) {
    return null;
  }

  return (
    // Phones: one strip you scroll sideways, the Plus card peeking in at the
    // edge so it reads as more to see.
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 tablet:mx-0 tablet:grid tablet:grid-cols-2 tablet:gap-4 tablet:overflow-visible tablet:px-0">
      <div
        className={classNames(
          'shrink-0 snap-start tablet:w-auto',
          hasInvite ? 'w-5/6' : 'w-full tablet:col-span-2',
        )}
      >
        <LeaderboardRankCard getBoard={getBoard} />
      </div>
      {hasInvite && (
        <div className="w-5/6 shrink-0 snap-start tablet:w-auto">
          <LeaderboardInviteCard />
        </div>
      )}
    </div>
  );
};

export const LeaderboardHub = ({
  boards,
  companies,
}: LeaderboardHubProps): ReactElement => {
  const getBoard = useCallback(
    (type: LeaderboardType) => boards[type] ?? noItems,
    [boards],
  );
  const hasBoards = LEADERBOARD_BOARDS.some(
    (board) => getBoard(board.type).length > 0,
  );

  return (
    <>
      <ActionRow getBoard={getBoard} />
      <LeaderboardTopReputation
        items={getBoard(LeaderboardType.HighestReputation)}
      />
      {hasBoards && <LeaderboardStandouts getBoard={getBoard} />}
      <section className="flex flex-col gap-3">
        <LeaderboardHeading title="Every leaderboard" />
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptopL:grid-cols-4">
          {LEADERBOARD_BOARDS.filter((board) => boards[board.type]).map(
            (board) => (
              <LeaderboardUserBoardTile
                key={board.type}
                type={board.type}
                items={getBoard(board.type)}
              />
            ),
          )}
          <LeaderboardCompanyTile items={companies} />
        </div>
      </section>
    </>
  );
};
