import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { LazyImage } from '../LazyImage';
import { Loader } from '../Loader';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { useTrackedAchievement } from '../../hooks/profile/useTrackedAchievement';
import { LogEvent, TargetType } from '../../lib/log';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { getTargetCount } from '../../graphql/user/achievements';
import { sortLockedAchievements } from './achievement/sortAchievements';

const SPARKLE_DURATION_MS = 4500;

const sparkles = Array.from({ length: 60 }, (_, i) => ({
  id: `s${i}`,
  left: `${5 + ((i * 17 + 7) % 90)}%`,
  drift: ((i * 13) % 25) - 12,
  fall: 320 + ((i * 19) % 120),
  delay: (i * 37) % 1200,
  size: 3 + ((i * 7) % 5),
}));

interface AchievementCompletionModalProps extends ModalProps {
  achievementId: string;
  onAfterClose?: () => void;
}

export const AchievementCompletionModal = ({
  achievementId,
  onRequestClose,
  ...props
}: AchievementCompletionModalProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { achievements, isPending } = useProfileAchievements(user);
  const { trackedAchievement, trackAchievement } = useTrackedAchievement(
    user?.id,
  );

  const [phase, setPhase] = useState<'celebrate' | 'pickNext'>('celebrate');
  const [isTracking, setIsTracking] = useState(false);
  const [showSparkles, setShowSparkles] = useState(true);
  const [sparklesFalling, setSparklesFalling] = useState(false);
  const loggedImpression = useRef(false);
  const handleClose = (event?: MouseEvent | KeyboardEvent) =>
    onRequestClose?.(event);

  const unlockedAchievement = useMemo(
    () => achievements?.find((item) => item.achievement.id === achievementId),
    [achievementId, achievements],
  );

  const lockedAchievements = useMemo(() => {
    return achievements ? sortLockedAchievements(achievements) : [];
  }, [achievements]);

  useEffect(() => {
    if (!showSparkles) {
      return undefined;
    }

    const fallTimer = setTimeout(() => setSparklesFalling(true), 10);
    const hideTimer = setTimeout(() => {
      setShowSparkles(false);
      setSparklesFalling(false);
    }, SPARKLE_DURATION_MS);

    return () => {
      clearTimeout(fallTimer);
      clearTimeout(hideTimer);
    };
  }, [showSparkles]);

  useEffect(() => {
    if (phase !== 'celebrate' || !achievementId || loggedImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.AchievementCompletion,
      target_id: achievementId,
    });

    loggedImpression.current = true;
  }, [achievementId, logEvent, phase]);

  const handleTrack = async (
    event: MouseEvent,
    selectedAchievementId: string,
  ): Promise<void> => {
    setIsTracking(true);

    try {
      await trackAchievement(selectedAchievementId);
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.AchievementCompletion,
        target_id: selectedAchievementId,
      });
      handleClose(event);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={handleClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={handleClose} />
      <Modal.Body className="relative flex flex-col gap-4 overflow-hidden">
        {phase === 'celebrate' && showSparkles && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {sparkles.map((sparkle) => (
              <span
                key={sparkle.id}
                className="absolute top-0 block rounded-full bg-accent-cheese-default transition-all ease-out"
                style={{
                  left: sparkle.left,
                  width: sparkle.size,
                  height: sparkle.size,
                  opacity: sparklesFalling ? 0 : 1,
                  transform: sparklesFalling
                    ? `translateY(${sparkle.fall}px) translateX(${sparkle.drift}px)`
                    : 'translateY(-8px) translateX(0px)',
                  transitionDuration: '2500ms',
                  transitionDelay: `${sparkle.delay}ms`,
                  boxShadow: `0 0 ${sparkle.size + 2}px ${
                    sparkle.size / 2
                  }px rgba(255, 207, 80, 0.4)`,
                }}
              />
            ))}
          </div>
        )}

        {phase === 'celebrate' && (
          <>
            {isPending && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader className="size-8" />
                <Typography type={TypographyType.Callout} bold>
                  Loading achievement...
                </Typography>
              </div>
            )}

            {!isPending && unlockedAchievement && (
              <>
                <div className="relative mx-auto mt-2">
                  <div className="absolute inset-2 rounded-full bg-accent-cheese-subtler blur-xl" />
                  <LazyImage
                    imgSrc={unlockedAchievement.achievement.image}
                    imgAlt={unlockedAchievement.achievement.name}
                    className="relative size-24 rounded-16 object-cover"
                    fallbackSrc="https://daily.dev/default-achievement.png"
                  />
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <Typography
                    tag={TypographyTag.H2}
                    type={TypographyType.Title3}
                    bold
                  >
                    Achievement Unlocked!
                  </Typography>
                  <Typography type={TypographyType.Title4} bold>
                    {unlockedAchievement.achievement.name}
                  </Typography>
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                  >
                    {unlockedAchievement.achievement.description}
                  </Typography>
                  <div className="text-text-invert rounded-full bg-accent-cabbage-default px-3 py-1 font-bold typo-subhead">
                    +{unlockedAchievement.achievement.points} points
                  </div>
                </div>

                <Button
                  variant={ButtonVariant.Primary}
                  onClick={() => setPhase('pickNext')}
                >
                  Choose next goal
                </Button>
              </>
            )}

            {!isPending && !unlockedAchievement && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <Typography type={TypographyType.Title3} bold>
                  Achievement Unlocked!
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Let&apos;s pick your next goal.
                </Typography>
                <Button
                  variant={ButtonVariant.Primary}
                  onClick={() => setPhase('pickNext')}
                >
                  Choose next goal
                </Button>
              </div>
            )}
          </>
        )}

        {phase === 'pickNext' && (
          <>
            <div className="flex flex-col gap-1 text-center">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Title3}
                bold
              >
                What&apos;s your next goal?
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Pick an achievement to focus on.
              </Typography>
            </div>

            {lockedAchievements.length === 0 && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                You unlocked every achievement.
              </Typography>
            )}

            {lockedAchievements.length > 0 && (
              <div className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto">
                {lockedAchievements.map((userAchievement) => {
                  const target = getTargetCount(userAchievement.achievement);
                  const progressPercentage = Math.min(
                    (userAchievement.progress / target) * 100,
                    100,
                  );
                  const isTracked =
                    userAchievement.achievement.id ===
                    trackedAchievement?.achievement.id;

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
                          onClick={(event) =>
                            handleTrack(event, userAchievement.achievement.id)
                          }
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

            <div className="text-center">
              <ClickableText
                className="text-text-tertiary typo-callout"
                onClick={handleClose}
              >
                Maybe later
              </ClickableText>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AchievementCompletionModal;
