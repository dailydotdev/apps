import React, { ReactElement } from 'react';
import { UserStats } from '../../graphql/users';
import { ActivityContainer, ActivitySectionTitle } from './ActivitySection';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoBody, typoSubhead } from '../../styles/typography';

const OverallStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, ${sizeN(36)});
  grid-column-gap: ${sizeN(6)};
`;

const OverallStatContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${sizeN(3)};
  background: var(--theme-background-secondary);
  border-radius: ${sizeN(3)};
`;

const OverallStatData = styled.div`
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoBody}
`;

const OverallStatDescription = styled.div`
  color: var(--theme-label-tertiary);
  ${typoSubhead}
`;

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
      <OverallStats>
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
      </OverallStats>
    </ActivityContainer>
  );
}
