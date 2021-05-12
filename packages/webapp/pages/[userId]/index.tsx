import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import styled from '@emotion/styled';
import {
  addDays,
  endOfYear,
  startOfTomorrow,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
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
import AuthContext from '../../../shared/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import Rank from '../../components/Rank';
import { RANK_NAMES } from '@dailydotdev/shared/src/lib/rank';
import CommentsSection from '../../components/profile/CommentsSection';
import PostsSection from '../../components/profile/PostsSection';
import AuthorStats from '../../components/profile/AuthorStats';
import CalendarHeatmap from '../../components/CalendarHeatmap';
import ProgressiveEnhancementContext from '../../../shared/src/contexts/ProgressiveEnhancementContext';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import { laptop } from '../../styles/media';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';

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
const readHistoryToTooltip = (value: UserReadHistory, date: Date): string => {
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  if (!value?.reads) {
    return `No articles read on ${formattedDate}`;
  }
  return `<strong>${value.reads} article${
    value.reads > 1 ? 's' : ''
  } read</strong> on ${formattedDate}`;
};

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

const BASE_YEAR = 2018;
const currentYear = new Date().getFullYear();
const dropdownOptions = [
  'Last year',
  ...Array.from(new Array(currentYear - BASE_YEAR + 1), (_, i) =>
    (currentYear - i).toString(),
  ),
];

const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user, tokenRefreshed } = useContext(AuthContext);
  const fullHistory = useMedia([laptop.replace('@media ', '')], [true], false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const [selectedHistoryYear, setSelectedHistoryYear] = useState(0);
  const [before, after] = useMemo<[Date, Date]>(() => {
    if (!fullHistory) {
      const start = startOfTomorrow();
      return [start, subMonths(subDays(start, 2), 6)];
    }
    if (!selectedHistoryYear) {
      const start = startOfTomorrow();
      return [start, subYears(subDays(start, 2), 1)];
    }
    const startYear = new Date(0);
    startYear.setFullYear(parseInt(dropdownOptions[selectedHistoryYear]));
    return [addDays(endOfYear(startYear), 1), startYear];
  }, [selectedHistoryYear]);
  const [readingHistory, setReadingHistory] = useState<
    UserReadingRankHistoryData & UserReadHistoryData
  >(null);

  const { data: remoteReadingHistory } = useQuery<
    UserReadingRankHistoryData & UserReadHistoryData
  >(
    ['reading_history', profile?.id, selectedHistoryYear],
    () =>
      request(`${apiUrl}/graphql`, USER_READING_HISTORY_QUERY, {
        id: profile?.id,
        before,
        after,
      }),
    {
      enabled: !!profile && tokenRefreshed && !!before && !!after,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  useEffect(() => {
    if (remoteReadingHistory) {
      setReadingHistory(remoteReadingHistory);
      requestIdleCallback(async () => {
        const mod = await import('react-tooltip');
        mod.default.rebuild();
      });
    }
  }, [remoteReadingHistory]);

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
              Articles read in{' '}
              {fullHistory
                ? selectedHistoryYear > 0
                  ? dropdownOptions[selectedHistoryYear]
                  : 'the last year'
                : 'the last months'}
              {totalReads >= 0 && <span>({totalReads})</span>}
              <Dropdown
                className="ml-auto hidden laptop:block"
                selectedIndex={selectedHistoryYear}
                options={dropdownOptions}
                onChange={(val, index) => setSelectedHistoryYear(index)}
                buttonSize="small"
                style={{ width: '7.5rem' }}
              />
            </ActivitySectionTitle>
            <CalendarHeatmap
              startDate={after}
              endDate={before}
              values={readingHistory.userReadHistory}
              valueToCount={readHistoryToValue}
              valueToTooltip={readHistoryToTooltip}
            />
            <div className="flex items-center justify-between mt-4 typo-footnote">
              <div className="text-theme-label-quaternary">
                Inspired by GitHub
              </div>
              <div className="flex items-center">
                <div className="mr-2">Less</div>
                <div
                  className="w-2 h-2 mr-0.5 border border-theme-divider-quaternary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="w-2 h-2 mr-0.5 bg-theme-label-disabled"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="w-2 h-2 mr-0.5 bg-theme-label-quaternary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="w-2 h-2 mr-0.5 bg-theme-label-primary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div className="ml-2">More</div>
              </div>
            </div>
            {windowLoaded && (
              <ReactTooltip
                backgroundColor="var(--balloon-color)"
                delayHide={100}
                html={true}
              />
            )}
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
