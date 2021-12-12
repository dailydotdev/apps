import React, {
  CSSProperties,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import classNames from 'classnames';
import RadialProgress from './RadialProgress';
import {
  FINAL_RANK,
  NO_RANK,
  rankToColor,
  rankToGradientStopBottom,
  rankToGradientStopTop,
  RANK_NAMES,
  STEPS_PER_RANK,
} from '../lib/rank';
import Rank from './Rank';
import styles from './RankProgress.module.css';

const notificationDuration = 300;

export type RankProgressProps = {
  progress: number;
  rank: number;
  nextRank?: number;
  showRankAnimation?: boolean;
  showCurrentRankSteps?: boolean;
  className?: string;
  onRankAnimationFinish?: () => unknown;
  fillByDefault?: boolean;
  smallVersion?: boolean;
  showRadialProgress?: boolean;
  showTextProgress?: boolean;
  rankLastWeek?: number;
};

const getRankName = (rank: number): string =>
  rank > 0 ? RANK_NAMES[rank - 1] : NO_RANK;

export function RankProgress({
  progress,
  rank,
  nextRank,
  showRankAnimation = false,
  showCurrentRankSteps = false,
  className,
  onRankAnimationFinish,
  fillByDefault = false,
  smallVersion = false,
  showRadialProgress = true,
  showTextProgress = false,
  rankLastWeek,
}: RankProgressProps): ReactElement {
  const [prevProgress, setPrevProgress] = useState(progress);
  const [animatingProgress, setAnimatingProgress] = useState(false);
  const [forceColor, setForceColor] = useState(false);
  const [shownRank, setShownRank] = useState(
    showRankAnimation ? rank - 1 : rank,
  );
  const attentionRef = useRef<HTMLDivElement>();
  const progressRef = useRef<HTMLDivElement>();
  const badgeRef = useRef<SVGSVGElement>();

  const finalRank = shownRank === STEPS_PER_RANK.length;
  const levelUp = () =>
    rank >= shownRank &&
    rank > 0 &&
    (rank !== rankLastWeek || progress === STEPS_PER_RANK[rank - 1]);
  const getLevelText = levelUp() ? 'Level up' : '+1 Reading day';
  const shouldForceColor = animatingProgress || forceColor || fillByDefault;

  const steps = useMemo(() => {
    if (
      showRankAnimation ||
      showCurrentRankSteps ||
      (finalRank && progress < STEPS_PER_RANK[rank - 1])
    ) {
      return STEPS_PER_RANK[rank - 1];
    }
    if (!finalRank) {
      return STEPS_PER_RANK[rank];
    }
    return 0;
  }, [showRankAnimation, showCurrentRankSteps, shownRank, progress, rank]);

  const animateRank = () => {
    setForceColor(true);
    const firstAnimationDuration = 400;
    const maxScale = 1.666;

    const progressAnimation = showRadialProgress
      ? progressRef.current.animate(
          [
            {
              transform: 'scale(1)',
              '--radial-progress-completed-step': rankToColor(shownRank),
            },
            { transform: `scale(${maxScale})` },
            {
              transform: 'scale(1)',
              '--radial-progress-completed-step': rankToColor(rank),
            },
          ],
          { duration: firstAnimationDuration, fill: 'forwards' },
        )
      : null;

    const firstBadgeAnimation = badgeRef.current.animate(
      [
        {
          transform: 'scale(1)',
          '--stop-color1': rankToGradientStopBottom(shownRank),
          '--stop-color2': rankToGradientStopTop(shownRank),
        },
        { transform: `scale(${maxScale})`, opacity: 1 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration: firstAnimationDuration, fill: 'forwards' },
    );
    firstBadgeAnimation.onfinish = () => {
      setShownRank(rank);
      // Let the new rank update
      setTimeout(() => {
        const attentionAnimation = showRankAnimation
          ? attentionRef.current.animate(
              [
                {
                  transform: 'scale(0.5)',
                  opacity: 1,
                },
                {
                  transform: 'scale(1.5)',
                  opacity: 0,
                },
              ],
              { duration: 600, fill: 'forwards' },
            )
          : null;
        const lastBadgeAnimation = badgeRef.current.animate(
          [
            {
              transform: `scale(${2 - maxScale})`,
              opacity: 0,
              '--stop-color1': rankToGradientStopBottom(rank),
              '--stop-color2': rankToGradientStopTop(rank),
            },
            {
              transform: 'scale(1)',
              opacity: 1,
              '--stop-color1': rankToGradientStopBottom(rank),
              '--stop-color2': rankToGradientStopTop(rank),
            },
          ],
          { duration: 100, fill: 'forwards' },
        );
        if (attentionAnimation) {
          attentionAnimation.onfinish = () => {
            progressAnimation?.cancel();
            firstBadgeAnimation.cancel();
            lastBadgeAnimation.cancel();
            attentionAnimation.cancel();
            setForceColor(false);
            onRankAnimationFinish?.();
          };
        } else {
          progressAnimation?.cancel();
          firstBadgeAnimation.cancel();
          lastBadgeAnimation.cancel();
          attentionAnimation?.cancel();
          setForceColor(false);
          onRankAnimationFinish?.();
        }
      });
    };
  };

  const onProgressTransitionEnd = () => {
    if (showRankAnimation || levelUp()) {
      setAnimatingProgress(false);
      animateRank();
    } else {
      setTimeout(() => setAnimatingProgress(false), 2000);
    }
  };

  useEffect(() => {
    if (!showRankAnimation) {
      setShownRank(rank);
    }
  }, [rank]);

  useEffect(() => {
    if (
      progress > prevProgress &&
      (!rank ||
        showRankAnimation ||
        levelUp() ||
        STEPS_PER_RANK[rank - 1] !== progress)
    ) {
      if (!showRadialProgress) animateRank();
      setAnimatingProgress(true);
    }
    setPrevProgress(progress);
  }, [progress]);

  const getNextRankText = (useRank: number): string => {
    if (finalRank && progress >= STEPS_PER_RANK[useRank - 1]) return FINAL_RANK;
    if (
      finalRank ||
      (useRank === rankLastWeek && progress < STEPS_PER_RANK[rank - 1])
    )
      return `Re-earn: ${progress}/${STEPS_PER_RANK[rank - 1]} days`;
    if (useRank === 0) return `Earn: ${progress}/3 days`;
    return `Next level: ${RANK_NAMES[rank]}`;
  };

  return (
    <>
      <div
        className={classNames(
          className,
          'relative z-1 border-1',
          styles.rankProgress,
          {
            [styles.enableColors]: shownRank > 0,
            [styles.forceColor]: shouldForceColor,
            [styles.smallVersion]: smallVersion && showRadialProgress,
            [styles.smallVersionClosed]: smallVersion && !showRadialProgress,
          },
        )}
        style={
          shownRank > 0
            ? ({
                '--rank-color': rankToColor(shownRank),
                '--rank-stop-color1': rankToGradientStopBottom(shownRank),
                '--rank-stop-color2': rankToGradientStopTop(shownRank),
              } as CSSProperties)
            : {}
        }
      >
        {showRankAnimation && (
          <div
            className="absolute -z-1 w-full h-full bg-theme-active rounded-full opacity-0 l-0 t-0"
            ref={attentionRef}
          />
        )}
        {showRadialProgress && (
          <RadialProgress
            progress={progress}
            steps={steps}
            onTransitionEnd={onProgressTransitionEnd}
            ref={progressRef}
            className={styles.radialProgress}
          />
        )}
        <SwitchTransition mode="out-in">
          <CSSTransition
            timeout={notificationDuration}
            key={animatingProgress}
            classNames="rank-notification-slide-down"
            mountOnEnter
            unmountOnExit
          >
            {levelUp() || !animatingProgress ? (
              <Rank
                rank={shownRank}
                className={classNames(
                  'absolute inset-0 w-2/3 h-2/3 m-auto',
                  styles.rank,
                  shownRank && styles.hasRank,
                )}
                ref={badgeRef}
              />
            ) : (
              <strong className="flex absolute inset-0 justify-center items-center text-theme-rank typo-callout">
                +1
              </strong>
            )}
          </CSSTransition>
        </SwitchTransition>
      </div>
      {showTextProgress && (
        <SwitchTransition mode="out-in">
          <CSSTransition
            timeout={notificationDuration}
            key={animatingProgress}
            classNames="rank-notification-slide-down"
            mountOnEnter
            unmountOnExit
          >
            <div className="flex flex-col items-start ml-3">
              <span className="font-bold text-theme-rank typo-callout">
                {animatingProgress ? getLevelText : getRankName(shownRank)}
              </span>
              <span className="typo-footnote text-theme-label-tertiary">
                {getNextRankText(nextRank)}
              </span>
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}
    </>
  );
}
