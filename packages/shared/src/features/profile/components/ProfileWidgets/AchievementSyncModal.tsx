import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { LazyImage } from '../../../../components/LazyImage';
import { Loader } from '../../../../components/Loader';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import type {
  AchievementSyncResult,
  UserAchievement,
} from '../../../../graphql/user/achievements';

const REVEAL_DELAY_MS = 1000;
const POP_VISIBLE_MS = 200;
const POP_FADE_MS = 150;
const SPARKLE_DURATION_MS = 4500;
const SCORE_SHAKE_MS = 300;
const STACK_VISIBLE_COUNT = 3;

const stackPositionStyles = [
  { translateY: 0, scale: 1, zIndex: 30 },
  { translateY: 8, scale: 0.97, zIndex: 20 },
  { translateY: 16, scale: 0.94, zIndex: 10 },
];

const sparkles = Array.from({ length: 60 }, (_, i) => ({
  id: `s${i}`,
  left: `${5 + ((i * 17 + 7) % 90)}%`,
  drift: ((i * 13) % 25) - 12,
  fall: 320 + ((i * 19) % 120),
  delay: (i * 37) % 1200,
  size: 3 + ((i * 7) % 5),
}));

interface AchievementSyncModalProps extends Omit<ModalProps, 'children'> {
  result: AchievementSyncResult | null;
  isPending: boolean;
}

const getTargetCount = (
  achievement: UserAchievement['achievement'],
): number => {
  return achievement.criteria?.targetCount ?? 1;
};

const AchievementRevealCard = ({
  achievement,
  stackIndex,
  isExiting,
}: {
  achievement: UserAchievement;
  stackIndex: number;
  isExiting: boolean;
}): ReactElement => {
  const isTop = stackIndex === 0;
  const position =
    stackPositionStyles[stackIndex] ??
    stackPositionStyles[STACK_VISIBLE_COUNT - 1];

  const transform =
    isExiting && isTop
      ? 'translateY(-40px) scale(0.95)'
      : `translateY(${position.translateY}px) scale(${position.scale})`;

  return (
    <div
      className="absolute inset-x-0 mx-auto flex w-full max-w-[24rem] flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-5 text-center transition-all duration-150 ease-out"
      style={{
        transform,
        opacity: isExiting && isTop ? 0 : 1,
        zIndex: position.zIndex,
      }}
    >
      <div className="size-16 overflow-hidden rounded-16">
        <LazyImage
          imgSrc={achievement.achievement.image}
          imgAlt={achievement.achievement.name}
          className="size-full object-cover"
          fallbackSrc="https://daily.dev/default-achievement.png"
        />
      </div>
      <Typography type={TypographyType.Title4} bold>
        {achievement.achievement.name}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {achievement.achievement.description}
      </Typography>
      <Typography type={TypographyType.Subhead} bold>
        +{achievement.achievement.points} points
      </Typography>
    </div>
  );
};

export const AchievementSyncModal = ({
  result,
  isPending,
  onRequestClose,
  ...rest
}: AchievementSyncModalProps): ReactElement => {
  const [contentVisible, setContentVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isRevealComplete, setIsRevealComplete] = useState(false);
  const [isScoreShaking, setIsScoreShaking] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparklesFalling, setSparklesFalling] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setContentVisible(true));
    const delay = setTimeout(() => setIsReady(true), REVEAL_DELAY_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(delay);
    };
  }, []);

  const visibleStack = useMemo(() => {
    if (!result) {
      return [];
    }

    return result.newlyUnlockedAchievements.slice(
      currentIndex,
      currentIndex + STACK_VISIBLE_COUNT,
    );
  }, [currentIndex, result]);

  useEffect(() => {
    if (!result) {
      setScore(0);
      setCurrentIndex(0);
      setIsFading(false);
      setIsRevealComplete(false);
      setShowSparkles(false);
      setSparklesFalling(false);
      return;
    }

    const baseScore = result.totalPoints - result.pointsGained;

    setScore(baseScore);
    setCurrentIndex(0);
    setIsFading(false);
    setIsRevealComplete(result.newlyUnlockedAchievements.length === 0);
    setShowSparkles(false);
    setSparklesFalling(false);
  }, [result]);

  useEffect(() => {
    if (!result || isPending || !isReady || isRevealComplete) {
      return undefined;
    }

    if (currentIndex >= result.newlyUnlockedAchievements.length) {
      setIsRevealComplete(true);
      if (result.pointsGained > 0) {
        setShowSparkles(true);
      }
      return undefined;
    }

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, POP_VISIBLE_MS);

    const nextTimer = setTimeout(() => {
      setScore(
        (value) =>
          value +
          result.newlyUnlockedAchievements[currentIndex].achievement.points,
      );
      setIsScoreShaking(true);
      setCurrentIndex((value) => value + 1);
      setIsFading(false);
    }, POP_VISIBLE_MS + POP_FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, isPending, isReady, isRevealComplete, result]);

  useEffect(() => {
    if (!isScoreShaking) {
      return undefined;
    }

    const timer = setTimeout(() => setIsScoreShaking(false), SCORE_SHAKE_MS);
    return () => clearTimeout(timer);
  }, [isScoreShaking]);

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

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      overlayClassName="!bg-background-default"
      onRequestClose={onRequestClose}
      {...rest}
    >
      <ModalHeader>
        <ModalHeader.Title className="typo-title3">
          Sync achievements
        </ModalHeader.Title>
      </ModalHeader>
      <Modal.Body
        className={classNames(
          'relative flex flex-col gap-5 pb-6 transition-opacity duration-500 ease-out',
          contentVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {showSparkles && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {sparkles.map((s) => (
              <span
                key={s.id}
                className="absolute top-0 block rounded-full bg-accent-cheese-default transition-all ease-out"
                style={{
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  opacity: sparklesFalling ? 0 : 1,
                  transform: sparklesFalling
                    ? `translateY(${s.fall}px) translateX(${s.drift}px)`
                    : 'translateY(-8px) translateX(0px)',
                  transitionDuration: '2500ms',
                  transitionDelay: `${s.delay}ms`,
                  boxShadow: `0 0 ${s.size + 2}px ${
                    s.size / 2
                  }px rgba(255, 207, 80, 0.4)`,
                }}
              />
            ))}
          </div>
        )}

        <div className="mx-auto flex flex-col items-center gap-1 text-center">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Achievement points
          </Typography>
          <Typography
            type={TypographyType.LargeTitle}
            bold
            className={classNames(
              'tabular-nums transition-transform duration-300 ease-out',
              isScoreShaking && 'scale-125',
            )}
          >
            {score}
          </Typography>
        </div>

        {isPending && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader className="size-8" />
            <Typography type={TypographyType.Body} bold>
              Hold on, syncing your achievements...
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              We are checking your profile activity and updating progress.
            </Typography>
          </div>
        )}

        {!isPending && visibleStack.length > 0 && !isRevealComplete && (
          <div
            className={classNames(
              'relative transition-opacity duration-500 ease-out',
              isReady ? 'opacity-100' : 'opacity-0',
            )}
            style={{ minHeight: '12rem' }}
          >
            {visibleStack.map((achievement, index) => (
              <AchievementRevealCard
                key={achievement.achievement.id}
                achievement={achievement}
                stackIndex={index}
                isExiting={isFading && index === 0}
              />
            ))}
          </div>
        )}

        {!isPending && result && isRevealComplete && (
          <div className="flex flex-col gap-4">
            <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-4 text-center">
              <Typography type={TypographyType.Footnote} bold className="mb-2">
                Sync complete
              </Typography>
              <Typography type={TypographyType.Title4} bold>
                {result.pointsGained > 0
                  ? `Congrats! +${result.pointsGained} points earned.`
                  : 'No new achievements unlocked this time.'}
              </Typography>
            </div>

            {result.closeAchievements.length > 0 && (
              <div className="flex flex-col gap-2">
                <Typography type={TypographyType.Callout} bold>
                  You&apos;re close to unlocking these! What are you waiting
                  for?
                </Typography>
                {result.closeAchievements.map((achievement) => {
                  const targetCount = getTargetCount(achievement.achievement);

                  return (
                    <div
                      key={achievement.achievement.id}
                      className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2"
                    >
                      <div className="size-10 overflow-hidden rounded-10">
                        <LazyImage
                          imgSrc={achievement.achievement.image}
                          imgAlt={achievement.achievement.name}
                          className="size-full object-cover"
                          fallbackSrc="https://daily.dev/default-achievement.png"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Typography
                          type={TypographyType.Callout}
                          bold
                          className="truncate"
                        >
                          {achievement.achievement.name}
                        </Typography>
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                        >
                          {Math.min(achievement.progress, targetCount)}/
                          {targetCount} progress
                        </Typography>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!isPending && (
          <div className="mt-2 flex justify-end">
            <Button variant={ButtonVariant.Primary} onClick={onRequestClose}>
              Done
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};
