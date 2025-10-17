import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProfileReadingData } from '@dailydotdev/shared/src/graphql/users';
import { USER_READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useActivityTimeFilter } from '@dailydotdev/shared/src/hooks/profile/useActivityTimeFilter';
import { ReadingTagsWidget } from '@dailydotdev/shared/src/components/profile/ReadingTagsWidget';
import { ReadingHeatmapWidget } from '@dailydotdev/shared/src/components/profile/ReadingHeatmapWidget';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { Readme } from '@dailydotdev/shared/src/components/profile/Readme';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useActions, useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { useReadingStreak } from '@dailydotdev/shared/src/hooks/streaks';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import dynamic from 'next/dynamic';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileUserExperiences } from '@dailydotdev/shared/src/features/profile/components/experience/ProfileUserExperiences';
import { useUploadCv } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { ReadingStreaksWidget } from '../../../shared/src/components/profile/ReadingStreaksWidget';

const BadgesAndAwards = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/profile/BadgesAndAwards').then(
      (mod) => mod.BadgesAndAwards,
    ),
  {
    ssr: false,
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = ({
  user: initialUser,
  noindex,
  userStats,
}: ProfileLayoutProps): ReactElement => {
  useJoinReferral();
  const { tokenRefreshed } = useAuthContext();
  const { isStreaksEnabled } = useReadingStreak();
  const { status, onUpload, shouldShow } = useUploadCv();
  const { checkHasCompleted } = useActions();
  const hasClosedBanner = useMemo(
    () => checkHasCompleted(ActionType.ClosedProfileBanner),
    [checkHasCompleted],
  );

  const { selectedHistoryYear, before, after, yearOptions, fullHistory } =
    useActivityTimeFilter();

  const { user, isUserSame } = useProfile(initialUser);

  const { data: readingHistory, isLoading } = useQuery<ProfileReadingData>({
    queryKey: generateQueryKey(
      RequestKey.ReadingStats,
      user,
      selectedHistoryYear,
    ),

    queryFn: () =>
      gqlClient.request(USER_READING_HISTORY_QUERY, {
        id: user?.id,
        before,
        after,
        version: 2,
        limit: 6,
      }),
    enabled: !!user && tokenRefreshed && !!before && !!after,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(user, {}, noindex),
  };

  const shouldShowBanner = isUserSame && shouldShow && !hasClosedBanner;

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary">
      <NextSeo {...seo} />
      <ProfileHeader user={user} userStats={userStats} />
      <div className="flex flex-col gap-4 p-6">
        {shouldShowBanner && (
          <AutofillProfileBanner
            onUpload={onUpload}
            isLoading={status === 'pending'}
          />
        )}
        <Readme user={user} />
        <BadgesAndAwards user={user} />
        {isStreaksEnabled && readingHistory?.userStreakProfile && (
          <ReadingStreaksWidget
            streak={readingHistory?.userStreakProfile}
            isLoading={isLoading}
          />
        )}
        {readingHistory?.userReadingRankHistory && (
          <>
            <ReadingTagsWidget
              mostReadTags={readingHistory?.userMostReadTags}
            />
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
        <ProfileUserExperiences user={user} />
      </div>
    </div>
  );
};

ProfilePage.getLayout = getProfileLayout;
export default ProfilePage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
