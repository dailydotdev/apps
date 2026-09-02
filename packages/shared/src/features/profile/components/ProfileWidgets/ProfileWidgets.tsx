import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
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
import { useProfilePreview } from '../../../../hooks/profile/useProfilePreview';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { achievementTrackingWidgetFeature } from '../../../../lib/featureManagement';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { shouldShowAchievementTracker } from '../../../../lib/achievements';
import { profileStripBleed } from '../../common';

const BadgesAndAwards = dynamic(() =>
  import('./BadgesAndAwards').then((mod) => mod.BadgesAndAwards),
);

const AchievementsWidget = dynamic(() =>
  import('./AchievementsWidget').then((mod) => mod.AchievementsWidget),
);

const AchievementSyncPromptCheck = dynamic(() =>
  import('./AchievementSyncPromptCheck').then(
    (mod) => mod.AchievementSyncPromptCheck,
  ),
);

const AchievementTrackingWidget = dynamic(() =>
  import('./AchievementTrackingWidget').then(
    (mod) => mod.AchievementTrackingWidget,
  ),
);

/**
 * Both of the extras are optional because this reads neither as a requirement:
 * `userStats` is not touched at all, and `sources` is already handled empty. A
 * profile's static props carry them as optional (the not-found path has no user
 * to fetch them for), so demanding them here only moved that fact to the caller.
 */
export interface ProfileWidgetsProps
  extends Omit<ProfileV2, 'userStats' | 'sources'> {
  userStats?: ProfileV2['userStats'];
  sources?: ProfileV2['sources'];
  className?: string;
  enableSticky?: boolean;
}

export function ProfileWidgets({
  user,
  sources,
  className,
}: ProfileWidgetsProps): ReactElement {
  const { user: loggedUser, tokenRefreshed } = useAuthContext();
  const { optOutAchievements } = useSettingsContext();
  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();
  const { isPreviewMode, isOwner, togglePreview } = useProfilePreview(user);
  const isSameUser = loggedUser?.id === user.id;
  const {
    value: isAchievementTrackingWidgetEnabled,
    isLoading: isAchievementTrackingWidgetLoading,
  } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: isOwner,
  });
  const {
    unlockedCount,
    totalCount,
    isPending: isAchievementsPending,
  } = useProfileAchievements(
    isOwner ? user : null,
    isOwner && isAchievementTrackingWidgetEnabled === true,
  );
  const shouldRenderTrackingWidget = shouldShowAchievementTracker({
    isExperimentEnabled: isAchievementTrackingWidgetEnabled === true,
    unlockedCount,
    totalCount,
  });
  const shouldShowTrackingWidget =
    isOwner &&
    !isAchievementTrackingWidgetLoading &&
    !isAchievementsPending &&
    shouldRenderTrackingWidget;

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
        // Below laptop this is the profile page's scrolling "Highlights" strip,
        // so it bleeds past the page's p-6 to clip at the card edge. At laptop
        // it becomes the sidebar column and sits inside the padding again.
        'my-4 flex gap-2 laptop:my-0 laptop:flex-col',
        profileStripBleed,
        'laptop:mx-0 laptop:px-0',
        className,
      )}
    >
      {isSameUser && (
        <ProfilePreviewToggle
          isPreviewMode={isPreviewMode}
          onToggle={togglePreview}
        />
      )}
      {isOwner && showProfileCompletion && (
        <ProfileCompletion className="hidden laptop:flex" />
      )}
      {isOwner && (
        <Share permalink={user?.permalink} className="hidden laptop:flex" />
      )}
      {!isPreviewMode &&
        canViewUserProfileAnalytics({
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
      {shouldShowTrackingWidget && !optOutAchievements && (
        <AchievementTrackingWidget user={user} />
      )}
      {(isOwner || squads.length > 0) && (
        <ActiveOrRecomendedSquads userId={user.id} squads={squads} />
      )}
      <BadgesAndAwards user={user} />
      {!optOutAchievements && (
        <>
          <AchievementsWidget user={user} />
          <AchievementSyncPromptCheck user={user} />
        </>
      )}
    </div>
  );
}
