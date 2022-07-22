import React, { ReactElement } from 'react';
import { UserStats } from '../../graphql/users';
import { ActivityContainer, ActivitySectionTitle } from './ActivitySection';
import classed from '../../lib/classed';

const OverallStatContainer = classed(
  'div',
  'flex flex-col p-3 bg-theme-bg-secondary rounded-xl w-36',
);
const OverallStatData = classed(
  'div',
  'text-theme-label-primary font-bold typo-body',
);
const OverallStatDescription = classed(
  'div',
  'text-theme-label-tertiary typo-subhead',
);

export default function AuthorStats({
  userStats,
}: {
  userStats: UserStats;
}): ReactElement {
  if (userStats?.numPostViews === null) {
    return <></>;
  }
  return (
    <ActivityContainer>
      <ActivitySectionTitle>Stats</ActivitySectionTitle>
      <div className="flex gap-x-6">
        <OverallStatContainer>
          <OverallStatData>
            {userStats.numPostViews.toLocaleString()}
          </OverallStatData>
          <OverallStatDescription>Article views</OverallStatDescription>
        </OverallStatContainer>
        <OverallStatContainer>
          <OverallStatData>
            {(
              userStats.numPostUpvotes + userStats.numCommentUpvotes
            ).toLocaleString()}
          </OverallStatData>
          <OverallStatDescription>Upvotes earned</OverallStatDescription>
        </OverallStatContainer>
      </div>
    </ActivityContainer>
  );
}
