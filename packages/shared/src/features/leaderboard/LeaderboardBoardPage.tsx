import type { ReactElement } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../components/ProfilePicture';
import { ProfileTooltip } from '../../components/profile/ProfileTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  CompanyLeaderboard,
  LeaderboardType,
  UserLeaderboard,
} from '../../graphql/leaderboard';
import { formatLeaderboardScore } from './boards';
import { LeaderboardScoreValue } from './LeaderboardScore';
import {
  LeaderboardEmptyBoard,
  LeaderboardHeading,
  LeaderboardListRow,
} from './LeaderboardRows';
import {
  getLeaderboardRankLabel,
  useLeaderboardPosition,
} from './useLeaderboardPosition';

interface LeaderboardBoardPageProps {
  type: LeaderboardType;
  title: string;
  userItems?: UserLeaderboard[];
  companyItems?: CompanyLeaderboard[];
}

/** Your own row under the list, when the list doesn't already have you. */
const YouRow = ({
  type,
  listed,
}: {
  type: LeaderboardType;
  listed: boolean;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { position, state } = useLeaderboardPosition(type);

  if (!user || !position || state === 'empty' || listed) {
    return null;
  }

  return (
    <ol className="border-t border-border-subtlest-tertiary pt-2">
      <LeaderboardListRow
        rank={position.rank ?? getLeaderboardRankLabel(position)}
        name="You"
        href={user.permalink}
        image={
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Medium}
            nativeLazyLoading
          />
        }
        value={<LeaderboardScoreValue type={type} score={position.score} />}
        highlight
      />
    </ol>
  );
};

/** A board's full ranking: one centered column of the hub's rows. */
export const LeaderboardBoardPage = ({
  type,
  title,
  userItems,
  companyItems,
}: LeaderboardBoardPageProps): ReactElement => {
  const { user } = useAuthContext();
  const count = companyItems?.length ?? userItems?.length ?? 0;

  return (
    <section className="mx-auto flex w-full max-w-[40rem] flex-col gap-2">
      <LeaderboardHeading title={title} />
      {count === 0 ? (
        <LeaderboardEmptyBoard />
      ) : (
        <ol className="flex flex-col">
          {companyItems?.map((item, index) => (
            <LeaderboardListRow
              key={item.company.name}
              rank={index + 1}
              name={item.company.name}
              image={
                <ProfilePicture
                  user={{ image: item.company.image, id: item.company.name }}
                  size={ProfileImageSize.Medium}
                  nativeLazyLoading
                />
              }
              value={formatLeaderboardScore(item.score)}
            />
          ))}
          {userItems?.map((item, index) => (
            <LeaderboardListRow
              key={item.user.id}
              rank={index + 1}
              name={item.user.name}
              href={item.user.permalink}
              highlight={item.user.id === user?.id}
              image={
                <ProfileTooltip userId={item.user.id} initialUser={item.user}>
                  <span className="flex shrink-0">
                    <ProfilePicture
                      user={item.user}
                      size={ProfileImageSize.Medium}
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
          ))}
        </ol>
      )}
      {userItems && (
        <YouRow
          type={type}
          listed={userItems.some((item) => item.user.id === user?.id)}
        />
      )}
    </section>
  );
};
