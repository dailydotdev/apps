import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery } from 'react-query';
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
  UserStatsData,
  ProfileReadingData,
} from '@dailydotdev/shared/src/graphql/users';
import {
  ActivityContainer,
  ActivitySectionTitle,
  ActivitySectionTitleStat,
  TitleWithLink,
} from '@dailydotdev/shared/src/components/profile/ActivitySection';
import { ReadingTagProgress } from '@dailydotdev/shared/src/components/profile/ReadingTagProgress';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import Rank from '@dailydotdev/shared/src/components/Rank';
import { RANK_NAMES } from '@dailydotdev/shared/src/lib/rank';
import CommentsSection from '@dailydotdev/shared/src/components/profile/CommentsSection';
import PostsSection from '@dailydotdev/shared/src/components/profile/PostsSection';
import AuthorStats from '@dailydotdev/shared/src/components/profile/AuthorStats';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import { laptop } from '@dailydotdev/shared/src/styles/media';
import CalendarHeatmap from '../../components/CalendarHeatmap';
import {
  getLayout as getProfileLayout,
  getStaticProps as getProfileStaticProps,
  getStaticPaths as getProfileStaticPaths,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';

const ReactTooltip = dynamic(() => import('react-tooltip'));

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const RanksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "ranksModal" */ '@dailydotdev/shared/src/components/modals/RanksModal'
    ),
);

const readHistoryToValue = (value: UserReadHistory): number => value.reads;
const readHistoryToTooltip = (
  value: UserReadHistory,
  date: Date,
): ReactNode => {
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  if (!value?.reads) {
    return `No articles read on ${formattedDate}`;
  }
  return (
    <>
      <strong>
        {value.reads} article{value.reads > 1 ? 's' : ''} read
      </strong>
      {' on'} {formattedDate}
    </>
  );
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
    <span className="font-bold typo-callout">{count}</span>
  </div>
);

const CURRENT_YEAR = new Date().getFullYear().toString();
const BASE_YEAR = 2018;
const currentYear = new Date().getFullYear();
const dropdownOptions = [
  'Last year',
  ...Array.from(new Array(currentYear - BASE_YEAR + 1), (_, i) =>
    (currentYear - i).toString(),
  ),
];

const getHistoryTitle = (
  fullHistory: boolean,
  selectedHistoryYear: number,
): string => {
  if (fullHistory) {
    if (selectedHistoryYear > 0) {
      return dropdownOptions[selectedHistoryYear];
    }
    return 'the last year';
  }
  return 'the last months';
};

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
    startYear.setFullYear(parseInt(dropdownOptions[selectedHistoryYear], 10));
    return [addDays(endOfYear(startYear), 1), startYear];
  }, [selectedHistoryYear]);
  const [readingHistory, setReadingHistory] =
    useState<ProfileReadingData>(null);

  const { data: remoteReadingHistory } = useQuery<ProfileReadingData>(
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
    <div className="flex relative flex-col items-stretch">
      {readingHistory?.userReadingRankHistory && (
        <>
          <ActivityContainer>
            <ActivitySectionTitle>
              <TitleWithLink
                title="Weekly goal"
                subtitle="Learn how we count"
                clickableTitle="weekly goals"
                link="https://docs.daily.dev/docs/your-profile/weekly-goal"
              />
              <Dropdown
                className="hidden laptop:block ml-auto"
                selectedIndex={selectedHistoryYear}
                options={dropdownOptions}
                onChange={(val, index) => setSelectedHistoryYear(index)}
                buttonSize="small"
                style={{ width: '8rem', minWidth: 'fit-content' }}
              />
            </ActivitySectionTitle>
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
            {showRanksModal && (
              <RanksModal
                rank={0}
                progress={0}
                hideProgress
                isOpen={showRanksModal}
                onRequestClose={() => setShowRanksModal(false)}
                confirmationText="Ok, got it"
                reads={0}
                devCardLimit={0}
              />
            )}
          </ActivityContainer>
          <ActivityContainer>
            <ActivitySectionTitle>
              <TitleWithLink
                title="Top tags by reading days"
                subtitle="Learn how we count"
                clickableTitle="top tags"
                link="https://docs.daily.dev/docs/your-profile/weekly-goal"
              />
            </ActivitySectionTitle>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 tablet:gap-10">
              {readingHistory.userMostReadTags?.map((tag) => (
                <ReadingTagProgress
                  key={tag.value}
                  tag={tag}
                  isFilterSameYear={
                    dropdownOptions[selectedHistoryYear] === CURRENT_YEAR
                  }
                />
              ))}
            </div>
          </ActivityContainer>
          <ActivityContainer>
            <ActivitySectionTitle>
              Articles read in{' '}
              {getHistoryTitle(fullHistory, selectedHistoryYear)}
              {totalReads >= 0 && (
                <ActivitySectionTitleStat>
                  ({totalReads})
                </ActivitySectionTitleStat>
              )}
            </ActivitySectionTitle>
            <CalendarHeatmap
              startDate={after}
              endDate={before}
              values={readingHistory.userReadHistory}
              valueToCount={readHistoryToValue}
              valueToTooltip={readHistoryToTooltip}
            />
            <div className="flex justify-between items-center mt-4 typo-footnote">
              <div className="text-theme-label-quaternary">
                Inspired by GitHub
              </div>
              <div className="flex items-center">
                <div className="mr-2">Less</div>
                <div
                  className="mr-0.5 w-2 h-2 border border-theme-divider-quaternary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="mr-0.5 w-2 h-2 bg-theme-label-disabled"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="mr-0.5 w-2 h-2 bg-theme-label-quaternary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div
                  className="mr-0.5 w-2 h-2 bg-theme-label-primary"
                  style={{ borderRadius: '0.1875rem' }}
                />
                <div className="ml-2">More</div>
              </div>
            </div>
            {windowLoaded && (
              <ReactTooltip
                backgroundColor="var(--balloon-color)"
                delayHide={100}
                html
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
    </div>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
