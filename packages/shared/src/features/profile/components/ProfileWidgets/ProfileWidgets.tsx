import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ActiveOrRecomendedSquads } from './ActiveOrRecomendedSquads';
import type { ProfileReadingData, ProfileV2 } from '../../../../graphql/users';
import { USER_READING_HISTORY_QUERY } from '../../../../graphql/users';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { gqlClient } from '../../../../graphql/common';
import { canViewUserProfileAnalytics } from '../../../../lib/user';
import { ReadingOverview } from './ReadingOverview';
import { ProfileCompletion } from './ProfileCompletion';
import { Share } from './Share';
import { ProfileViewsWidget } from './ProfileViewsWidget';
import { useProfileCompletionIndicator } from '../../../../hooks/profile/useProfileCompletionIndicator';
import { ProfilePreviewToggle } from '../../../../components/profile/ProfilePreviewToggle';

const BadgesAndAwards = dynamic(() =>
  import('./BadgesAndAwards').then((mod) => mod.BadgesAndAwards),
);

export interface ProfileWidgetsProps extends ProfileV2 {
  className?: string;
  enableSticky?: boolean;
}

export function ProfileWidgets({
  user,
  sources,
  className,
}: ProfileWidgetsProps): ReactElement {
  const router = useRouter();
  const { user: loggedUser, tokenRefreshed } = useAuthContext();
  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();
  const isSameUser = loggedUser?.id === user.id;
  const isPreviewMode = router.query.preview === 'true';

  const handleTogglePreview = () => {
    const newQuery = { ...router.query };
    if (isPreviewMode) {
      delete newQuery.preview;
    } else {
      newQuery.preview = 'true';
    }
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    );
  };

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
  const squads = sources?.edges?.map((s) => s.node.source) ?? [];

  return (
    <div
      className={classNames(
        'my-4 flex gap-2 laptop:my-0 laptop:flex-col',
        className,
      )}
    >
      {isSameUser && (
        <ProfilePreviewToggle
          isPreviewMode={isPreviewMode}
          onToggle={handleTogglePreview}
        />
      )}
      {isSameUser && showProfileCompletion && (
        <ProfileCompletion className="hidden laptop:flex" />
      )}
      {isSameUser && (
        <Share permalink={user?.permalink} className="hidden laptop:flex" />
      )}
      {canViewUserProfileAnalytics({
        user: loggedUser,
        profileUserId: user.id,
      }) && <ProfileViewsWidget userId={user.id} />}
      <ReadingOverview
        readHistory={readingHistory?.userReadHistory}
        before={before}
        after={after}
        streak={readingHistory?.userStreakProfile}
        mostReadTags={readingHistory?.userMostReadTags}
        isLoading={isReadingHistoryLoading}
      />
      {(isSameUser || squads.length > 0) && (
        <ActiveOrRecomendedSquads userId={user.id} squads={squads} />
      )}
      <BadgesAndAwards user={user} />
    </div>
  );
}
