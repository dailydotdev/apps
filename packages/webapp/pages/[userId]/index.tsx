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
  ActivitySectionHeader,
  ActivitySectionTitle,
  ActivitySectionTitleStat,
} from '@dailydotdev/shared/src/components/profile/ActivitySection';
import { ReadingTagProgress } from '@dailydotdev/shared/src/components/profile/ReadingTagProgress';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import Rank from '@dailydotdev/shared/src/components/Rank';
import { RANKS, RankHistoryProps } from '@dailydotdev/shared/src/lib/rank';
import CommentsSection from '@dailydotdev/shared/src/components/profile/CommentsSection';
import PostsSection from '@dailydotdev/shared/src/components/profile/PostsSection';
import AuthorStats from '@dailydotdev/shared/src/components/profile/AuthorStats';
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

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

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
      &nbsp;on {formattedDate}
    </>
  );
};

const RankHistory = ({
  rank,
  rankName,
  count,
}: RankHistoryProps): ReactElement => (
  <div
    className="flex flex-col tablet:flex-row items-center p-2 tablet:py-1 tablet:pr-4 tablet:pl-2 font-bold rounded-12 border typo-callout border-theme-bg-secondary"
    aria-label={`${rankName}: ${count}`}
  >
    <Rank className="w-8 h-8" rank={rank} colorByRank />
    <span className="hidden tablet:block ml-1 text-theme-label-tertiary">
      {rankName}
    </span>
    <span className="tablet:ml-auto">{count}</span>
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
  const { user, tokenRefreshed } = useContext(AuthContext);
  const fullHistory = useMedia([laptop.replace('@media ', '')], [true], false);
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
    const selected = parseInt(dropdownOptions[selectedHistoryYear], 10);
    const startYear = new Date(selected, 0, 1);

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
        version: 2,
        limit: 6,
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
            <ActivitySectionHeader
              title="Weekly goal"
              subtitle="Learn how we count"
              clickableTitle="weekly goals"
              link="https://docs.daily.dev/docs/your-profile/weekly-goal"
            >
              <Dropdown
                className="hidden laptop:block ml-auto w-32 min-w-fit"
                selectedIndex={selectedHistoryYear}
                options={dropdownOptions}
                onChange={(val, index) => setSelectedHistoryYear(index)}
                buttonSize="small"
              />
            </ActivitySectionHeader>
            <div className="grid grid-cols-5 tablet:grid-cols-3 tablet:gap-2 gap-x-1 gap-y-3 tablet:max-w-full max-w-[17rem]">
              {RANKS.map((rank) => (
                <RankHistory
                  key={rank.level}
                  rank={rank.level}
                  rankName={rank.name}
                  count={
                    readingHistory.userReadingRankHistory.find(
                      (history) => history.rank === rank.level,
                    )?.count ?? 0
                  }
                />
              ))}
            </div>
          </ActivityContainer>
          <ActivityContainer>
            <ActivitySectionHeader
              title="Top tags by reading days"
              subtitle="Learn how we count"
              clickableTitle="top tags"
              link="https://docs.daily.dev/docs/your-profile/weekly-goal"
            />
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3 tablet:gap-x-10 tablet:max-w-full max-w-[17rem]">
              {readingHistory.userMostReadTags?.map((tag) => (
                <ReadingTagProgress key={tag.value} tag={tag} />
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
