import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { AchievementsList } from './AchievementsList';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ProfileEmptyScreen } from '../../../../components/profile/ProfileEmptyScreen';
import { MedalBadgeIcon } from '../../../../components/icons';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { achievementTrackingWidgetFeature } from '../../../../lib/featureManagement';
import { shouldShowAchievementTracker } from '../../../../lib/achievements';

const AchievementTrackingWidget = dynamic(() =>
  import('../ProfileWidgets/AchievementTrackingWidget').then(
    (mod) => mod.AchievementTrackingWidget,
  ),
);

interface ProfileAchievementsProps {
  user: PublicProfile;
  className?: string;
}

function AchievementsSkeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-10 bg-surface-float"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-16 bg-surface-float"
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileAchievements({
  user,
  className,
}: ProfileAchievementsProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user.id;
  const {
    value: isAchievementTrackingWidgetEnabled,
    isLoading: isAchievementTrackingWidgetLoading,
  } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: isOwner,
  });
  const {
    achievements,
    unlockedCount,
    totalCount,
    totalPoints,
    isPending,
    isError,
  } = useProfileAchievements(user);
  const shouldRenderTrackingWidget = shouldShowAchievementTracker({
    isExperimentEnabled: isAchievementTrackingWidgetEnabled === true,
    unlockedCount,
    totalCount,
  });
  const shouldShowTrackingWidget =
    isOwner &&
    !isAchievementTrackingWidgetLoading &&
    shouldRenderTrackingWidget;
  const { openModal } = useLazyModal();

  if (isPending) {
    return (
      <div className={classNames('flex flex-col gap-4', className)}>
        <div className="flex flex-col items-center gap-1">
          <Typography
            type={TypographyType.Title1}
            tag={TypographyTag.H1}
            color={TypographyColor.Primary}
            bold
          >
            Achievements
          </Typography>
          <div className="h-5 w-32 animate-pulse rounded-8 bg-surface-float" />
        </div>
        <AchievementsSkeleton />
      </div>
    );
  }

  if (isError || !achievements) {
    return (
      <div className={className}>
        <ProfileEmptyScreen
          title="Could not load achievements"
          text="Something went wrong while loading achievements. Please try again later."
        />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className={className}>
        <ProfileEmptyScreen
          title="No achievements yet"
          text="Achievements will appear here as you use daily.dev."
        />
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <div className="flex flex-col items-center gap-1">
        <Typography
          type={TypographyType.Title1}
          tag={TypographyTag.H1}
          color={TypographyColor.Primary}
          bold
        >
          Achievements
        </Typography>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <MedalBadgeIcon className="size-6 text-text-primary" />
            <Typography
              type={TypographyType.Title3}
              tag={TypographyTag.H2}
              color={TypographyColor.Primary}
              bold
            >
              {totalPoints.toLocaleString()}
            </Typography>
          </div>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            ({unlockedCount}/{totalCount})
          </Typography>
        </div>
        {loggedUser && !isOwner && (
          <Button
            variant={ButtonVariant.Secondary}
            onClick={() =>
              openModal({
                type: LazyModal.CompareAchievements,
                props: {
                  profileUser: user,
                  profileAchievements: achievements,
                },
              })
            }
          >
            Compare achievements
          </Button>
        )}
      </div>
      {shouldShowTrackingWidget && <AchievementTrackingWidget user={user} />}
      <AchievementsList achievements={achievements} user={user} />
    </div>
  );
}
