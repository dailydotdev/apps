import React, { ReactElement, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ProfileReadingData,
  USER_READING_HISTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useActivityTimeFilter } from '@dailydotdev/shared/src/hooks/profile/useActivityTimeFilter';
import { ReadingTagsWidget } from '@dailydotdev/shared/src/components/profile/ReadingTagsWidget';
import { ReadingHeatmapWidget } from '@dailydotdev/shared/src/components/profile/ReadingHeatmapWidget';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { Readme } from '@dailydotdev/shared/src/components/profile/Readme';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { useReadingStreak } from '@dailydotdev/shared/src/hooks/streaks';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout';
import { ReadingStreaksWidget } from '../../../shared/src/components/profile/ReadingStreaksWidget';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = ({
  user: initialUser,
}: ProfileLayoutProps): ReactElement => {
  useJoinReferral();
  const { tokenRefreshed } = useContext(AuthContext);
  const { isStreaksEnabled } = useReadingStreak();

  const { selectedHistoryYear, before, after, yearOptions, fullHistory } =
    useActivityTimeFilter();

  const user = useProfile(initialUser);

  const { data: readingHistory, isLoading } = useQuery<ProfileReadingData>(
    generateQueryKey(RequestKey.ReadingStats, user, selectedHistoryYear),
    () =>
      gqlClient.request(USER_READING_HISTORY_QUERY, {
        id: user?.id,
        before,
        after,
        version: 2,
        limit: 6,
      }),
    {
      enabled: !!user && tokenRefreshed && !!before && !!after,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
      <Readme user={user} />
      {isStreaksEnabled && readingHistory?.userStreakProfile && (
        <ReadingStreaksWidget
          streak={readingHistory?.userStreakProfile}
          isLoading={isLoading}
        />
      )}
      {readingHistory?.userReadingRankHistory && (
        <>
          <ReadingTagsWidget mostReadTags={readingHistory?.userMostReadTags} />
          <ReadingHeatmapWidget
            fullHistory={fullHistory}
            selectedHistoryYear={selectedHistoryYear}
            readHistory={readingHistory?.userReadHistory}
            before={before}
            after={after}
            yearOptions={yearOptions}
          />
        </>
      )}
    </div>
  );
};

ProfilePage.getLayout = getProfileLayout;
export default ProfilePage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
