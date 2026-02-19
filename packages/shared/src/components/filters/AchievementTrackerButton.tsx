import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MedalBadgeIcon } from '../icons';
import { AlertColor, AlertDot } from '../AlertDot';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../hooks/profile/useTrackedAchievement';
import { getTargetCount } from '../../graphql/user/achievements';
import { useViewSize, ViewSize } from '../../hooks';
import { webappUrl } from '../../lib/constants';
import { achievementTrackingWidgetFeature } from '../../lib/featureManagement';
import { shouldShowAchievementTracker } from '../../lib/achievements';

export function AchievementTrackerButton(): ReactElement | null {
  const { push } = useRouter();
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const {
    value: isAchievementTrackingWidgetEnabled,
    isLoading: isAchievementTrackingWidgetLoading,
  } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: !!user,
  });
  const {
    unlockedCount,
    totalCount,
    isPending: isAchievementsPending,
  } = useProfileAchievements(user, isAchievementTrackingWidgetEnabled === true);

  const shouldRender = shouldShowAchievementTracker({
    isExperimentEnabled: isAchievementTrackingWidgetEnabled === true,
    unlockedCount,
    totalCount,
  });
  const shouldQueryTrackedAchievement =
    !!user &&
    !isAchievementTrackingWidgetLoading &&
    (isAchievementTrackingWidgetEnabled !== true || !isAchievementsPending) &&
    shouldRender;
  const {
    trackedAchievement,
    isPending: isTrackedAchievementPending,
    isTrackPending,
    isUntrackPending,
  } = useTrackedAchievement(undefined, shouldQueryTrackedAchievement);

  const isTrackingAchievement =
    !!trackedAchievement && !trackedAchievement.unlockedAt;
  const targetCount = isTrackingAchievement
    ? getTargetCount(trackedAchievement.achievement)
    : 1;
  const progressValue = isTrackingAchievement
    ? Math.min(trackedAchievement.progress, targetCount)
    : 0;
  const progressLabel = isTrackingAchievement
    ? `${progressValue}/${targetCount}`
    : null;
  const showAttentionDot =
    !isTrackedAchievementPending && !isTrackingAchievement;
  const isTrackerUpdating = isTrackPending || isUntrackPending;

  const handleClick = useCallback(() => {
    if (!user?.username) {
      throw new Error(
        'Achievement tracker button requires an authenticated user with a username.',
      );
    }

    return push(`${webappUrl}${user.username}/achievements`);
  }, [push, user?.username]);

  if (
    !user ||
    isAchievementTrackingWidgetLoading ||
    (isAchievementTrackingWidgetEnabled === true && isAchievementsPending) ||
    !shouldRender
  ) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        size={ButtonSize.Medium}
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
        icon={<MedalBadgeIcon />}
        onClick={handleClick}
        disabled={isTrackerUpdating}
        aria-label={
          progressLabel
            ? `Achievement tracker (${progressLabel})`
            : 'Achievement tracker'
        }
      >
        {progressLabel}
      </Button>
      {showAttentionDot && (
        <AlertDot
          color={AlertColor.Bun}
          className="pointer-events-none right-2 top-2 border border-background-default"
        />
      )}
    </div>
  );
}
