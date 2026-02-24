import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MedalBadgeIcon } from '../icons';
import { AlertColor, AlertDot } from '../AlertDot';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../hooks/profile/useTrackedAchievement';
import { getTargetCount } from '../../graphql/user/achievements';
import { useViewSize, ViewSize } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { achievementTrackingWidgetFeature } from '../../lib/featureManagement';
import { shouldShowAchievementTracker } from '../../lib/achievements';
import { LazyImage } from '../LazyImage';
import { LazyModal } from '../modals/common/types';

export function AchievementTrackerButton(): ReactElement | null {
  const { openModal, closeModal } = useLazyModal();
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
    achievements,
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
    trackAchievement,
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
  const showAttentionDot =
    !isTrackedAchievementPending && !isTrackingAchievement;
  const isTrackerUpdating = isTrackPending || isUntrackPending;

  const buttonLabel = (() => {
    if (!isTrackingAchievement) {
      return 'Track achievement';
    }

    if (targetCount <= 1) {
      return trackedAchievement.achievement?.unit;
    }

    const { unit } = trackedAchievement.achievement;

    return unit
      ? `${progressValue} of ${targetCount} ${unit}`
      : `${progressValue} of ${targetCount}`;
  })();

  const handleTrack = async (achievementId: string) => {
    await trackAchievement(achievementId);
    closeModal();
  };

  const handleClick = () => {
    openModal({
      type: LazyModal.AchievementPicker,
      props: {
        achievements: achievements ?? [],
        trackedAchievementId: trackedAchievement?.achievement.id,
        onTrack: handleTrack,
      },
    });
  };

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
        icon={isTrackingAchievement ? undefined : <MedalBadgeIcon />}
        onClick={handleClick}
        disabled={isTrackerUpdating}
        aria-label={
          isTrackingAchievement
            ? `${trackedAchievement.achievement.name}${
                targetCount > 1 ? ` (${progressValue} of ${targetCount})` : ''
              }`
            : 'Track an achievement'
        }
      >
        {isTrackingAchievement && (
          <LazyImage
            imgSrc={trackedAchievement.achievement.image}
            imgAlt={trackedAchievement.achievement.name}
            className={classNames(
              'size-5 rounded-6 object-cover',
              buttonLabel && 'mr-2',
            )}
          />
        )}
        {buttonLabel}
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
