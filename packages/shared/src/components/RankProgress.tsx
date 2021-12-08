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

export function RankProgress({
  progress,
  rank,
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
  const [progressDelta, setProgressDelta] = useState(1);
  const [forceColor, setForceColor] = useState(false);
  const [shownRank, setShownRank] = useState(
    showRankAnimation ? rank - 1 : rank,
  );
  const attentionRef = useRef<HTMLDivElement>();
  const progressRef = useRef<HTMLDivElement>();
  const badgeRef = useRef<SVGSVGElement>();

  const finalRank = shownRank === STEPS_PER_RANK.length;

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
        const attentionAnimation = attentionRef.current.animate(
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
        );
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
        attentionAnimation.onfinish = () => {
          progressAnimation?.cancel();
          firstBadgeAnimation.cancel();
          lastBadgeAnimation.cancel();
          attentionAnimation.cancel();
          setForceColor(false);
          onRankAnimationFinish?.();
        };
      });
    };
  };

  const onProgressTransitionEnd = () => {
    if (showRankAnimation) {
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
      (rank || showRankAnimation || STEPS_PER_RANK[rank - 1] !== progress)
    ) {
      if (!showRadialProgress) animateRank();
      setProgressDelta(progress - prevProgress);
      setAnimatingProgress(true);
    }
    setPrevProgress(progress);
  }, [progress]);

  const shouldForceColor = animatingProgress || forceColor || fillByDefault;
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
        <Rank
          rank={shownRank}
          className={classNames(
            'absolute inset-0 w-2/3 h-2/3 m-auto',
            styles.rank,
            shownRank && styles.hasRank,
          )}
          ref={badgeRef}
        />
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
                {animatingProgress
                  ? `+${progressDelta} Article${
                      progressDelta > 1 ? 's' : ''
                    } read`
                  : RANK_NAMES[rank > 0 ? rank - 1 : 0]}
              </span>
              <span className="typo-footnote text-theme-label-tertiary">
                {animatingProgress
                  ? `${5} articles read this week`
                  : `Last week: ${RANK_NAMES[rankLastWeek > 0 ? rank - 1 : 0]}`}
              </span>
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}
    </>
  );
}
