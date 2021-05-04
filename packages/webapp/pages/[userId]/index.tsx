import React, { ReactElement, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import styled from '@emotion/styled';
import { startOfTomorrow, subDays, subYears } from 'date-fns';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  USER_READING_HISTORY_QUERY,
  USER_STATS_QUERY,
  UserReadHistory,
  UserReadHistoryData,
  UserReadingRankHistoryData,
  UserStatsData,
} from '../../graphql/users';
import {
  ActivityContainer,
  ActivitySectionTitle,
} from '../../components/profile/ActivitySection';
import AuthContext from '../../contexts/AuthContext';
import dynamic from 'next/dynamic';
import Rank from '../../components/Rank';
import { RANK_NAMES } from '../../lib/rank';
import CommentsSection from '../../components/profile/CommentsSection';
import PostsSection from '../../components/profile/PostsSection';
import AuthorStats from '../../components/profile/AuthorStats';
import CalendarHeatmap from '../../components/CalendarHeatmap';
import ProgressiveEnhancementContext from '../../contexts/ProgressiveEnhancementContext';

const ReactTooltip = dynamic(() => import('react-tooltip'));

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
`;

const RanksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "ranksModal" */ '../../components/modals/RanksModal'
    ),
);

const readHistoryToValue = (value: UserReadHistory): number => value.reads;

const RankHistory = ({
  rank,
  rankName,
  count,
}: {
  rank: number;
  rankName: string;
  count: number;
}): ReactElement => (
  <div
    className="flex flex-col items-center p-2 mr-2 rounded-xl bg-theme-bg-secondary"
    aria-label={`${rankName}: ${count}`}
  >
    <Rank rank={rank} colorByRank />
    <span className="typo-callout font-bold">{count}</span>
  </div>
);

const before = startOfTomorrow();
const after = subYears(subDays(before, 2), 1);

const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showRanksModal, setShowRanksModal] = useState(false);

  const { data: readingHistory } = useQuery<
    UserReadingRankHistoryData & UserReadHistoryData
  >(
    ['reading_history', profile?.id],
    () =>
      request(`${apiUrl}/graphql`, USER_READING_HISTORY_QUERY, {
        id: profile?.id,
        before,
        after,
      }),
    {
      enabled: !!profile && tokenRefreshed,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  const totalReads = useMemo(
    () =>
      readingHistory?.userReadHistory.reduce((acc, val) => acc + val.reads, 0),
    [readingHistory],
  );

  const { data: userStats } = useQuery<UserStatsData>(
    ['user_stats', profile?.id],
    () =>
      request(`${apiUrl}/graphql`, USER_STATS_QUERY, {
        id: profile?.id,
      }),
    {
      enabled: !!profile && tokenRefreshed,
    },
  );

  const isSameUser = profile?.id === user?.id;

  const commentsSection = (
    <CommentsSection
      userId={profile?.id}
      tokenRefreshed={tokenRefreshed}
      isSameUser={isSameUser}
      numComments={userStats?.userStats?.numComments}
    />
  );

  const postsSection = (
    <PostsSection
      userId={profile?.id}
      isSameUser={isSameUser}
      numPosts={userStats?.userStats?.numPosts}
    />
  );

  return (
    <Container>
      {readingHistory?.userReadingRankHistory && (
        <>
          <ActivityContainer>
            <ActivitySectionTitle>Weekly goal</ActivitySectionTitle>
            <div className="flex flex-wrap">
              {RANK_NAMES.map((rankName, rank) => (
                <RankHistory
                  key={rankName}
                  rank={rank + 1}
                  rankName={rankName}
                  count={
                    readingHistory.userReadingRankHistory.find(
                      (history) => history.rank === rank + 1,
                    )?.count ?? 0
                  }
                />
              ))}
            </div>
            <button
              className="bg-none border-none typo-callout text-theme-label-link mt-4 self-start focus-outline"
              onClick={() => setShowRanksModal(true)}
            >
              Learn how we count weekly goals
            </button>
            {showRanksModal && (
              <RanksModal
                rank={0}
                progress={0}
                hideProgress
                isOpen={showRanksModal}
                onRequestClose={() => setShowRanksModal(false)}
                confirmationText="Ok, got it"
              />
            )}
          </ActivityContainer>
          <ActivityContainer>
            <ActivitySectionTitle>
              Articles read in the last year
              {totalReads >= 0 && <span>({totalReads})</span>}
            </ActivitySectionTitle>
            <CalendarHeatmap
              startDate={after}
              endDate={before}
              values={readingHistory.userReadHistory}
              valueToCount={readHistoryToValue}
            />
            {windowLoaded && <ReactTooltip />}
          </ActivityContainer>
        </>
      )}
      {userStats?.userStats && (
        <>
          <AuthorStats userStats={userStats.userStats} />
          {postsSection}
          {commentsSection}
        </>
      )}
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
