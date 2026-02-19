import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonVariant } from '../buttons/Button';
import { LazyImage } from '../LazyImage';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { UserAchievement } from '../../graphql/user/achievements';
import { getTargetCount } from '../../graphql/user/achievements';

export interface AchievementPickerModalProps extends ModalProps {
  achievements: UserAchievement[];
  trackedAchievementId?: string | null;
  onTrack: (achievementId: string) => Promise<void>;
}

const getProgressRatio = (achievement: UserAchievement): number => {
  const targetCount = getTargetCount(achievement.achievement);

  if (targetCount <= 0) {
    return 0;
  }

  return Math.min(achievement.progress / targetCount, 1);
};

export const AchievementPickerModal = ({
  achievements,
  trackedAchievementId,
  onTrack,
  onRequestClose,
  ...props
}: AchievementPickerModalProps): ReactElement => {
  const [isTracking, setIsTracking] = useState(false);

  const lockedAchievements = useMemo(() => {
    return achievements
      .filter((achievement) => !achievement.unlockedAt)
      .sort((a, b) => {
        const ratioDelta = getProgressRatio(b) - getProgressRatio(a);
        if (ratioDelta !== 0) {
          return ratioDelta;
        }

        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }

        return b.achievement.points - a.achievement.points;
      });
  }, [achievements]);

  const handleTrack = async (achievementId: string) => {
    setIsTracking(true);
    try {
      await onTrack(achievementId);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <div className="flex flex-col gap-4 p-6">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          Choose an achievement to track
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Pick one to focus on next.
        </Typography>

        {lockedAchievements.length === 0 && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            You unlocked every achievement.
          </Typography>
        )}

        {lockedAchievements.length > 0 && (
          <div className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto pr-1">
            {lockedAchievements.map((userAchievement) => {
              const target = getTargetCount(userAchievement.achievement);
              const progressPercentage = Math.min(
                (userAchievement.progress / target) * 100,
                100,
              );
              const isTracked =
                userAchievement.achievement.id === trackedAchievementId;

              return (
                <div
                  key={userAchievement.achievement.id}
                  className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
                >
                  <div className="flex items-start gap-3">
                    <LazyImage
                      imgSrc={userAchievement.achievement.image}
                      imgAlt={userAchievement.achievement.name}
                      className="size-10 rounded-10 object-cover"
                      fallbackSrc="https://daily.dev/default-achievement.png"
                    />
                    <div className="min-w-0 flex-1">
                      <Typography
                        type={TypographyType.Callout}
                        bold
                        className="truncate"
                      >
                        {userAchievement.achievement.name}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        className="line-clamp-2"
                      >
                        {userAchievement.achievement.description}
                      </Typography>
                    </div>
                    <Button
                      variant={
                        isTracked
                          ? ButtonVariant.Secondary
                          : ButtonVariant.Primary
                      }
                      disabled={isTracking || isTracked}
                      onClick={() => handleTrack(userAchievement.achievement.id)}
                    >
                      {isTracked ? 'Tracking' : 'Track'}
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {userAchievement.progress}/{target}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {userAchievement.achievement.points} pts
                    </Typography>
                  </div>
                  <div className="rounded-sm mt-1 h-1.5 w-full overflow-hidden bg-accent-pepper-subtler">
                    <div
                      className="rounded-sm h-full bg-accent-cabbage-default transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AchievementPickerModal;
