import type { ReactElement } from 'react';
import React from 'react';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { LazyImage } from '../../../../components/LazyImage';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ProgressBar } from '../../../../components/fields/ProgressBar';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { PinIcon } from '../../../../components/icons';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../../../hooks/profile/useTrackedAchievement';
import { getTargetCount } from '../../../../graphql/user/achievements';
import type { PublicProfile } from '../../../../lib/user';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';

interface AchievementTrackingWidgetProps {
  user: PublicProfile;
}

export const AchievementTrackingWidget = ({
  user,
}: AchievementTrackingWidgetProps): ReactElement => {
  const { openModal, closeModal } = useLazyModal();
  const { logEvent } = useLogContext();

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

  const handleTrack = async (achievementId: string) => {
    await trackAchievement(achievementId);
    closeModal();
  };

  const handleUntrack = async () => {
    await untrackAchievement();
    closeModal();
  };

  const openPicker = () => {
    logEvent({
      event_name: LogEvent.OpenAchievementPickerModal,
    });

    openModal({
      type: LazyModal.AchievementPicker,
      props: {
        achievements: achievements ?? [],
        trackedAchievementId: trackedAchievement?.achievement.id,
        onTrack: handleTrack,
        onUntrack: handleUntrack,
      },
    });
  };

  const targetCount = trackedAchievement
    ? getTargetCount(trackedAchievement.achievement)
    : 1;
  const progressPercentage = trackedAchievement
    ? Math.min((trackedAchievement.progress / targetCount) * 100, 100)
    : 0;

  const isBusy = isPending || isTrackPending || isUntrackPending;

  return (
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
            <ProgressBar
              percentage={progressPercentage}
              shouldShowBg
              className={{
                wrapper: 'h-1.5 rounded-14',
                bar: 'h-full rounded-14',
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={ButtonVariant.Secondary}
              disabled={isBusy}
              onClick={openPicker}
            >
              Change
            </Button>
            <Button
              variant={ButtonVariant.Subtle}
              disabled={isBusy}
              onClick={async () => {
                await untrackAchievement();
                logEvent({
                  event_name: LogEvent.UntrackAchievement,
                  extra: JSON.stringify({
                    achievement_id: trackedAchievement.achievement.id,
                  }),
                });
              }}
            >
              Stop tracking
            </Button>
          </div>
        </div>
      )}

      {!trackedAchievement && (
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
            onClick={openPicker}
          >
            Choose achievement
          </Button>
        </div>
      )}
    </ActivityContainer>
  );
};
