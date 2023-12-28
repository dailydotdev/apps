import React, { ReactElement, useContext } from 'react';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import { useQuery } from '@tanstack/react-query';
import {
  ProfileReadingData,
  USER_READING_HISTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/users';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { RanksWidget } from '@dailydotdev/shared/src/components/profile/RanksWidget';
import { useActivityTimeFilter } from '@dailydotdev/shared/src/hooks/profile/useActivityTimeFilter';
import { ReadingTagsWidget } from '@dailydotdev/shared/src/components/profile/ReadingTagsWidget';
import { ReadingHeatmapWidget } from '@dailydotdev/shared/src/components/profile/ReadingHeatmapWidget';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout/v2';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = ({ user }: ProfileLayoutProps): ReactElement => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;

  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  const { tokenRefreshed } = useContext(AuthContext);
  const {
    selectedHistoryYear,
    setSelectedHistoryYear,
    before,
    after,
    yearOptions,
    fullHistory,
  } = useActivityTimeFilter();

  const { data: readingHistory } = useQuery<ProfileReadingData>(
    generateQueryKey(RequestKey.ReadingStats, user, selectedHistoryYear),
    () =>
      request(graphqlUrl, USER_READING_HISTORY_QUERY, {
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
    <div className="flex flex-col gap-6 py-6 px-4">
      {!user.readmeHtml && isSameUser ? (
        <MyProfileEmptyScreen
          className="items-start"
          text="Do you love breaking production? Share with the world what has brought you so far"
          cta="Add readme"
        />
      ) : (
        isClient && <Markdown content={user.readmeHtml} />
      )}
      {readingHistory?.userReadingRankHistory && (
        <>
          <RanksWidget
            rankHistory={readingHistory?.userReadingRankHistory}
            yearOptions={yearOptions}
            selectedHistoryYear={selectedHistoryYear}
            setSelectedHistoryYear={setSelectedHistoryYear}
          />
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
