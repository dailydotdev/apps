import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { LazyImage } from '../../../../components/LazyImage';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { PinIcon, SparkleIcon } from '../../../../components/icons';
import { AchievementPickerModal } from '../../../../components/modals/AchievementPickerModal';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../../../hooks/profile/useTrackedAchievement';
import { getTargetCount } from '../../../../graphql/user/achievements';
import type { PublicProfile } from '../../../../lib/user';

interface AchievementTrackingWidgetProps {
  user: PublicProfile;
}

export const AchievementTrackingWidget = ({
  user,
}: AchievementTrackingWidgetProps): ReactElement => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showCompletedState, setShowCompletedState] = useState(false);
  const previousTrackedAchievementId = useRef<string | null>(null);
  const isManualUntrack = useRef(false);

  const { achievements, isPending: isAchievementsPending } =
    useProfileAchievements(user);
  const {
    trackedAchievement,
    isPending,
    trackAchievement,
    untrackAchievement,
    isTrackPending,
    isUntrackPending,
  } = useTrackedAchievement(user.id);

  useEffect(() => {
    const previousId = previousTrackedAchievementId.current;
    const currentId = trackedAchievement?.achievement.id ?? null;

    if (previousId && !currentId) {
      if (isManualUntrack.current) {
        isManualUntrack.current = false;
      } else {
        setShowCompletedState(true);
      }
    }

    if (currentId) {
      setShowCompletedState(false);
      isManualUntrack.current = false;
    }

    previousTrackedAchievementId.current = currentId;
  }, [trackedAchievement?.achievement.id]);

  const handleTrack = async (achievementId: string) => {
    await trackAchievement(achievementId);
    setShowCompletedState(false);
    setIsPickerOpen(false);
  };

  const targetCount = trackedAchievement
    ? getTargetCount(trackedAchievement.achievement)
    : 1;
  const progressPercentage = trackedAchievement
    ? Math.min((trackedAchievement.progress / targetCount) * 100, 100)
    : 0;

  const isBusy = isPending || isTrackPending || isUntrackPending;

  return (
    <>
      <ActivityContainer>
        <div className="flex items-center gap-1">
          <PinIcon className="size-4" />
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Achievement tracker
          </Typography>
        </div>

        {trackedAchievement && !trackedAchievement.unlockedAt && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <LazyImage
                imgSrc={trackedAchievement.achievement.image}
                imgAlt={trackedAchievement.achievement.name}
                className="size-12 rounded-12 object-cover"
                fallbackSrc="https://daily.dev/default-achievement.png"
              />
              <div className="min-w-0 flex-1">
                <Typography
                  type={TypographyType.Callout}
                  bold
                  className="truncate"
                >
                  {trackedAchievement.achievement.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="line-clamp-2"
                >
                  {trackedAchievement.achievement.description}
                </Typography>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Progress
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {trackedAchievement.progress}/{targetCount}
                </Typography>
              </div>
              <div className="rounded-sm h-1.5 w-full overflow-hidden bg-accent-pepper-subtler">
                <div
                  className="rounded-sm h-full bg-accent-cabbage-default transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={ButtonVariant.Secondary}
                disabled={isBusy}
                onClick={() => setIsPickerOpen(true)}
              >
                Change
              </Button>
              <Button
                variant={ButtonVariant.Subtle}
                disabled={isBusy}
                onClick={() => {
                  isManualUntrack.current = true;
                  return untrackAchievement();
                }}
              >
                Stop tracking
              </Button>
            </div>
          </div>
        )}

        {!trackedAchievement && showCompletedState && (
          <div className="relative mt-3 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
            <div className="opacity-20 pointer-events-none absolute -right-3 -top-3">
              <SparkleIcon className="size-14" />
            </div>
            <Typography type={TypographyType.Callout} bold>
              Completed!
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-1"
            >
              Choose your next achievement to keep the momentum.
            </Typography>
            <Button
              className="mt-3"
              variant={ButtonVariant.Primary}
              onClick={() => setIsPickerOpen(true)}
            >
              Choose next achievement
            </Button>
          </div>
        )}

        {!trackedAchievement && !showCompletedState && (
          <div className="mt-3 flex flex-col gap-3">
            <Typography type={TypographyType.Callout} bold>
              Track an achievement
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Pick an achievement to focus on.
            </Typography>
            <Button
              variant={ButtonVariant.Primary}
              disabled={isBusy || isAchievementsPending}
              onClick={() => setIsPickerOpen(true)}
            >
              Choose achievement
            </Button>
          </div>
        )}
      </ActivityContainer>

      {isPickerOpen && (
        <AchievementPickerModal
          isOpen={isPickerOpen}
          onRequestClose={() => setIsPickerOpen(false)}
          achievements={achievements ?? []}
          trackedAchievementId={trackedAchievement?.achievement.id}
          isTracking={isTrackPending}
          onTrack={handleTrack}
        />
      )}
    </>
  );
};
