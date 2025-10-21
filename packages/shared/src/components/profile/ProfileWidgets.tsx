import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import type { ProfileReadingData, ProfileV2 } from '../../graphql/users';
import { USER_READING_HISTORY_QUERY } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import { ReadingOverview } from './ProfileWidgets/ReadingOverview';
import { ProfileCompletion } from './ProfileWidgets/ProfileCompletion';

const BadgesAndAwards = dynamic(() =>
  import('./ProfileWidgets/BadgesAndAwards').then((mod) => mod.BadgesAndAwards),
);

export interface ProfileWidgetsProps extends ProfileV2 {
  className?: string;
  enableSticky?: boolean;
}

export function ProfileWidgets({
  user,
  className,
}: ProfileWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);

  const before = startOfTomorrow();
  const after = subMonths(subDays(before, 2), 5);

  const { data: readingHistory, isLoading: isReadingHistoryLoading } =
    useQuery<ProfileReadingData>({
      queryKey: generateQueryKey(RequestKey.ReadingStats, user),
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

  return (
    <div
      className={classNames(
        'my-4 flex gap-2 laptop:my-0 laptop:flex-col laptop:gap-6',
        className,
      )}
    >
      <ProfileCompletion className="hidden laptop:flex" />
      <BadgesAndAwards user={user} />
      {readingHistory?.userReadingRankHistory && (
        <ReadingOverview
          readHistory={readingHistory?.userReadHistory}
          before={before}
          after={after}
          streak={readingHistory?.userStreakProfile}
          mostReadTags={readingHistory?.userMostReadTags}
          isLoading={isReadingHistoryLoading}
        />
      )}
    </div>
  );
}
