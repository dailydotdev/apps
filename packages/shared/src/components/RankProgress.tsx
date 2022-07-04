import React, {
  CSSProperties,
  MutableRefObject,
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
  NO_RANK,
  rankToColor,
  rankToGradientStopBottom,
  rankToGradientStopTop,
  getNextRankText,
  isFinalRank,
  RANKS,
  getRank,
} from '../lib/rank';
import Rank from './Rank';
import styles from './RankProgress.module.css';
import useDebounce from '../hooks/useDebounce';

const notificationDuration = 300;

interface GetRankElementProps {
  shownRank: number;
  rank: number;
  badgeRef: MutableRefObject<SVGSVGElement>;
  plusRef: MutableRefObject<HTMLElement>;
  smallVersion: boolean;
  showRankAnimation: boolean;
  animatingProgress: boolean;
}

type RankElementProps = Pick<
  GetRankElementProps,
  'shownRank' | 'rank' | 'badgeRef'
>;
const RankElement = ({
  shownRank,
  rank,
  badgeRef,
}: RankElementProps): ReactElement => (
  <Rank
    rank={shownRank}
    className={classNames(
      'absolute inset-0 w-2/3 h-2/3 m-auto',
      styles.rank,
      shownRank && styles.hasRank,
    )}
    ref={badgeRef}
    colorByRank={rank > 0}
  />
);

const getRankElement = ({
  shownRank,
  rank,
  badgeRef,
  plusRef,
  smallVersion,
  showRankAnimation,
  animatingProgress,
}: GetRankElementProps): ReactElement => {
  const animating = showRankAnimation || animatingProgress;
  if (!smallVersion || !animating) {
    return (
      <RankElement shownRank={shownRank} rank={rank} badgeRef={badgeRef} />
    );
  }

  return (
    <strong
      ref={plusRef}
      className="flex absolute inset-0 justify-center items-center text-theme-rank typo-callout"
    >
      +1
    </strong>
  );
};

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
  rank > 0 ? RANKS[rank - 1].name : NO_RANK;

export function RankProgress({
  progress,
  rank = 0,
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
    showRankAnimation ? getRank(rank) : rank,
  );
  const attentionRef = useRef<HTMLDivElement>();
  const progressRef = useRef<HTMLDivElement>();
  const badgeRef = useRef<SVGSVGElement>();
  const plusRef = useRef<HTMLElement>();

  const rankIndex = getRank(rank);
  const finalRank = isFinalRank(rank);
  const levelUp = () =>
    rank > shownRank &&
    rank > 0 &&
    (rank !== rankLastWeek || progress === RANKS[rankIndex].steps);
  const getLevelText = levelUp() ? 'You made it 🏆' : '+1 Reading day';
  const shouldForceColor = animatingProgress || forceColor || fillByDefault;

  const [endAnimation] = useDebounce(() => {
    setAnimatingProgress(false);
  }, 2000);

  const steps = useMemo(() => {
    if (
      showRankAnimation ||
      showCurrentRankSteps ||
      (finalRank && progress < RANKS[rankIndex].steps)
    ) {
      return RANKS[rankIndex].steps;
    }

    if (!finalRank) {
      return RANKS[rank].steps;
    }
    return 0;
  }, [showRankAnimation, showCurrentRankSteps, shownRank, progress, rank]);

  const animateRank = () => {
    setForceColor(true);
    const animatedRef = badgeRef.current || plusRef.current;
    const firstAnimationDuration = 400;
    const maxScale = 1.666;

    const progressAnimation = showRadialProgress
      ? progressRef.current.animate(
          [
            {
              transform: 'scale(1) rotate(180deg)',
              '--radial-progress-completed-step': rankToColor(shownRank),
            },
            { transform: `scale(${maxScale}) rotate(180deg)` },
            {
              transform: 'scale(1) rotate(180deg)',
              '--radial-progress-completed-step': rankToColor(rank),
            },
          ],
          { duration: firstAnimationDuration, fill: 'forwards' },
        )
      : null;

    const firstBadgeAnimation = animatedRef.animate(
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

        const lastBadgeAnimation = animatedRef.animate(
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
        const cancelAnimations = () => {
          progressAnimation?.cancel();
          firstBadgeAnimation.cancel();
          lastBadgeAnimation?.cancel();
          attentionAnimation?.cancel();
          setForceColor(false);
          onRankAnimationFinish?.();
        };

        if (attentionAnimation) {
          attentionAnimation.onfinish = cancelAnimations;
        } else {
          cancelAnimations();
          endAnimation();
        }
      });
    };
  };

  const onProgressTransitionEnd = () => {
    if (showRankAnimation || levelUp()) {
      setAnimatingProgress(false);
      animateRank();
    } else {
      endAnimation();
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
        RANKS[rankIndex].steps !== progress)
    ) {
      if (!showRadialProgress) animateRank();
      setAnimatingProgress(true);
    }
    setPrevProgress(progress);
  }, [progress]);

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
            {getRankElement({
              shownRank,
              rank,
              badgeRef,
              plusRef,
              smallVersion,
              showRankAnimation,
              animatingProgress,
            })}
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
                {getNextRankText({
                  nextRank,
                  rank,
                  finalRank,
                  progress,
                  rankLastWeek,
                  showNextLevel: !finalRank,
                })}
              </span>
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}
    </>
  );
}
