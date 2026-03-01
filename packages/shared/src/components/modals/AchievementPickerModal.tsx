import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonVariant } from '../buttons/Button';
import { ProgressBar } from '../fields/ProgressBar';
import { LazyImage } from '../LazyImage';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { UserAchievement } from '../../graphql/user/achievements';
import { getTargetCount } from '../../graphql/user/achievements';
import { sortLockedAchievements } from './achievement/sortAchievements';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';

export interface AchievementPickerModalProps extends ModalProps {
  achievements: UserAchievement[];
  trackedAchievementId?: string | null;
  onTrack: (achievementId: string) => Promise<void>;
  onUntrack: () => Promise<void>;
}

export const AchievementPickerModal = ({
  achievements,
  trackedAchievementId,
  onTrack,
  onUntrack,
  onRequestClose,
  ...props
}: AchievementPickerModalProps): ReactElement => {
  const [isTracking, setIsTracking] = useState(false);
  const [isUntracking, setIsUntracking] = useState(false);
  const { logEvent } = useLogContext();

  const lockedAchievements = useMemo(() => {
    return sortLockedAchievements(achievements);
  }, [achievements]);

  const handleTrack = async (achievementId: string) => {
    setIsTracking(true);
    try {
      await onTrack(achievementId);
      logEvent({
        event_name: LogEvent.TrackAchievement,
        target_type: TargetType.AchievementCard,
        target_id: achievementId,
        extra: JSON.stringify({ origin: 'picker_modal' }),
      });
    } finally {
      setIsTracking(false);
    }
  };

  const handleUntrack = async () => {
    setIsUntracking(true);
    try {
      await onUntrack();
      logEvent({
        event_name: LogEvent.UntrackAchievement,
        target_type: TargetType.AchievementCard,
        extra: JSON.stringify({ origin: 'picker_modal' }),
      });
    } finally {
      setIsUntracking(false);
    }
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <Modal.Body className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-2">
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
                        isTracked ? ButtonVariant.Subtle : ButtonVariant.Primary
                      }
                      disabled={isTracking || isUntracking}
                      onClick={() =>
                        isTracked
                          ? handleUntrack()
                          : handleTrack(userAchievement.achievement.id)
                      }
                    >
                      {isTracked ? 'Stop tracking' : 'Track'}
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
                  <ProgressBar
                    percentage={progressPercentage}
                    shouldShowBg
                    className={{
                      wrapper: 'mt-1 h-1.5 rounded-14',
                      bar: 'h-full rounded-14',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AchievementPickerModal;
