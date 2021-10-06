import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { RankProgress } from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import AuthContext from '../contexts/AuthContext';
import { STEPS_PER_RANK } from '../lib/rank';
import OnboardingContext from '../contexts/OnboardingContext';
import Rank from './Rank';
import styles from './HeaderRankProgress.module.css';
import FeaturesContext from '../contexts/FeaturesContext';
import { getFeatureValue } from '../lib/featureManagement';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const { onboardingStep, onboardingReady, incrementOnboardingStep } =
    useContext(OnboardingContext);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { flags } = useContext(FeaturesContext);
  const devCardLimit = parseInt(
    getFeatureValue('feat_limit_dev_card', flags),
    10,
  );

  const {
    isLoading,
    rank,
    nextRank,
    progress,
    neverShowRankModal,
    levelUp,
    confirmLevelUp,
    reads,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  const showWelcome = onboardingStep === 1;
  const showRankAnimation = levelUp && neverShowRankModal;
  const closeRanksModal = () => {
    setShowRanksModal(false);
    if (showWelcome) {
      incrementOnboardingStep();
    }
  };

  return (
    <>
      {onboardingReady && (
        <button
          type="button"
          className={classNames(
            'flex items-center justify-center bg-theme-bg-primary cursor-pointer focus-outline',
            styles.rankButton,
            { [styles.attention]: showWelcome },
            className,
          )}
          onClick={() => setShowRanksModal(true)}
        >
          {showWelcome ? (
            <div
              className="flex justify-center items-center w-12 h-12 rounded-full bg-theme-label-primary"
              data-testid="welcomeButton"
            >
              <Rank
                rank={1}
                style={
                  {
                    '--stop-color1': 'var(--theme-background-primary)',
                    '--stop-color2': 'var(--theme-background-primary)',
                  } as CSSProperties
                }
              />
            </div>
          ) : (
            <RankProgress
              progress={
                showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress
              }
              rank={showRankAnimation ? nextRank : rank}
              showRankAnimation={showRankAnimation}
              fillByDefault
              onRankAnimationFinish={() =>
                setTimeout(() => confirmLevelUp(true), 1000)
              }
            />
          )}
        </button>
      )}
      {showRanksModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showRanksModal}
          onRequestClose={closeRanksModal}
          reads={reads}
          devCardLimit={devCardLimit}
        />
      )}
      {levelUp && !neverShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && !neverShowRankModal}
          onRequestClose={confirmLevelUp}
          showDevCard={reads >= devCardLimit || !devCardLimit}
        />
      )}
    </>
  );
}
