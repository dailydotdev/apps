import React, { ReactElement, useContext, useState } from 'react';
import { keyframes } from '@emotion/react';
import RankProgress from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import dynamic from 'next/dynamic';
import { focusOutline } from '../styles/helpers';
import AuthContext from '../contexts/AuthContext';
import { STEPS_PER_RANK } from '../lib/rank';
import { headerRankHeight } from '../styles/sizes';
import OnboardingContext from '../contexts/OnboardingContext';
import styled from '@emotion/styled';
import sizeN from '../macros/sizeN.macro';
import Rank from './Rank';
import classNames from 'classnames';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

const rankAttention = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const RankButton = styled.button`
  display: flex;
  width: ${headerRankHeight};
  height: ${headerRankHeight};
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: var(--theme-background-primary);
  cursor: pointer;
  ${focusOutline}

  &.attention {
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: var(--theme-hover);
      border-radius: 100%;
      z-index: -1;
      transition: background 0.1s linear;
      animation: ${rankAttention} 2s infinite ease-in-out;
      will-change: opacity, transform, background;
    }

    &:hover {
      &:before {
        background: var(--theme-active);
      }
    }
  }
`;

const WelcomeButton = styled.div`
  display: flex;
  width: ${sizeN(12)};
  height: ${sizeN(12)};
  align-items: center;
  justify-content: center;
  background: var(--theme-label-primary);
  border-radius: 100%;

  svg {
    --stop-color1: var(--theme-background-primary);
    --stop-color2: var(--theme-background-primary);
  }
`;

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const { showWelcome, onboardingReady, setShowWelcome } = useContext(
    OnboardingContext,
  );
  const [showModal, setShowModal] = useState(false);

  const {
    isLoading,
    rank,
    nextRank,
    progress,
    neverShowRankModal,
    levelUp,
    confirmLevelUp,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  const showRankAnimation = levelUp && neverShowRankModal;
  const closeRanksModal = () => {
    setShowModal(false);
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  return (
    <>
      {onboardingReady && (
        <RankButton
          className={classNames({ attention: showWelcome }, className)}
          onClick={() => setShowModal(true)}
        >
          {showWelcome ? (
            <WelcomeButton data-testid="welcomeButton">
              <Rank rank={1} />
            </WelcomeButton>
          ) : (
            <RankProgress
              progress={
                showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress
              }
              rank={showRankAnimation ? nextRank : rank}
              showRankAnimation={showRankAnimation}
              fillByDefault={showRankAnimation}
              onRankAnimationFinish={() =>
                setTimeout(() => confirmLevelUp(true), 1000)
              }
            />
          )}
        </RankButton>
      )}
      {showModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showModal}
          onRequestClose={closeRanksModal}
        />
      )}
      {levelUp && !neverShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && !neverShowRankModal}
          onRequestClose={confirmLevelUp}
        />
      )}
    </>
  );
}
