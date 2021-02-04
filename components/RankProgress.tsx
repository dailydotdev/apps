import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { CSSTransition } from 'react-transition-group';
import RadialProgress from './RadialProgress';
import {
  rankToColor,
  rankToGradientStopBottom,
  rankToGradientStopTop,
  STEPS_PER_RANK,
} from '../lib/rank';
import Rank from './Rank';
import sizeN from '../macros/sizeN.macro';
import { typoCaption1 } from '../styles/typography';

const StyledRadialProgress = styled(RadialProgress)`
  font-size: inherit;
  --radial-progress-step: var(--theme-label-disabled);
  --radial-progress-completed-step: var(--theme-label-tertiary);
  --radial-progress-transition-delay: 0.3s;
`;

const StyledRank = styled(Rank)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 66.666%;
  height: 66.666%;
  margin: auto;

  ${({ rank }) =>
    rank === 0
      ? `
  --stop-color1: var(--theme-label-disabled);
  --stop-color2: var(--theme-label-disabled);
  `
      : `
  --stop-color1: var(--theme-label-tertiary);
  --stop-color2: var(--theme-label-tertiary);
  `}

  & stop {
    transition: stop-color 0.1s linear;
  }
`;

const Attention = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background: var(--theme-active);
  z-index: -1;
  opacity: 0;
`;

const ProgressDelta = styled.div<{ rank: number }>`
  position: absolute;
  left: -${sizeN(14)};
  top: 100%;
  width: ${sizeN(40)};
  text-align: center;
  margin-top: ${sizeN(2)};
  color: ${({ rank }) => rankToColor(rank)};
  font-weight: bold;
  ${typoCaption1}
`;

const applyRankColor = (rank: number) => `
  ${StyledRadialProgress} {
    --radial-progress-completed-step: ${rankToColor(rank)};
  }

  ${StyledRank} {
    --stop-color1: ${rankToGradientStopBottom(rank)};
    --stop-color2: ${rankToGradientStopTop(rank)};
  }
`;

const notificationDuration = 300;

const Container = styled.div<{ rank: number; forceColor: boolean }>`
  position: relative;
  width: 1em;
  height: 1em;
  font-size: ${sizeN(12)};
  z-index: 1;

  ${({ rank, forceColor }) =>
    rank > 0 &&
    `&:hover {
      ${applyRankColor(rank)}
    }

    ${
      forceColor &&
      `&& {
      ${applyRankColor(rank)}
    }`
    }`}

  & .rank-notification-slide-down-enter-active, & .rank-notification-slide-down-exit-active {
    transition: opacity ${notificationDuration}ms ease-out,
      transform ${notificationDuration}ms ease-out;
  }

  && .rank-notification-slide-down-enter-active,
  & .rank-notification-slide-down-exit {
    opacity: 1;
    transform: translateY(0);
  }

  & .rank-notification-slide-down-enter,
  & .rank-notification-slide-down-exit-active {
    opacity: 0;
    transform: translateY(-${sizeN(1)});
  }
`;

export type RankProgressProps = {
  progress: number;
  rank: number;
  showRankAnimation?: boolean;
  showCurrentRankSteps?: boolean;
  className?: string;
  onRankAnimationFinish?: () => unknown;
  fillByDefault?: boolean;
};

export default function RankProgress({
  progress,
  rank,
  showRankAnimation = false,
  showCurrentRankSteps = false,
  className,
  onRankAnimationFinish,
  fillByDefault = false,
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
    const progressAnimation = progressRef.current.animate(
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
    );

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
          progressAnimation.cancel();
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
      (!rank || showRankAnimation || STEPS_PER_RANK[rank - 1] !== progress)
    ) {
      setProgressDelta(progress - prevProgress);
      setAnimatingProgress(true);
    }
    setPrevProgress(progress);
  }, [progress]);

  return (
    <Container
      rank={shownRank}
      forceColor={animatingProgress || forceColor || fillByDefault}
      className={className}
    >
      {showRankAnimation && <Attention ref={attentionRef} />}
      <StyledRadialProgress
        progress={progress}
        steps={steps}
        onTransitionEnd={onProgressTransitionEnd}
        ref={progressRef}
      />
      <StyledRank rank={shownRank} ref={badgeRef} />
      <CSSTransition
        in={animatingProgress && !showRankAnimation}
        timeout={notificationDuration}
        classNames="rank-notification-slide-down"
        mountOnEnter
        unmountOnExit
      >
        <ProgressDelta rank={shownRank}>
          +{progressDelta} Article{progressDelta > 1 ? 's' : ''} read
        </ProgressDelta>
      </CSSTransition>
    </Container>
  );
}
