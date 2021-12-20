import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { RankProgress } from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import AuthContext from '../contexts/AuthContext';
import { STEPS_PER_RANK } from '../lib/rank';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ './modals/AccountDetailsModal'
    ),
);

export default function RankProgressWrapper({
  sidebarExpanded,
  className,
}: {
  sidebarExpanded?: boolean;
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { flags } = useContext(FeaturesContext);
  const devCardLimit = parseInt(
    getFeatureValue(Features.DevcardLimit, flags),
    10,
  );
  const {
    rank,
    rankLastWeek,
    nextRank,
    progress,
    shouldShowRankModal,
    levelUp,
    confirmLevelUp,
    reads,
  } = useReadingRank();

  const showRankAnimation = levelUp && !shouldShowRankModal;
  const closeRanksModal = () => {
    setShowRanksModal(false);
  };

  return (
    <>
      <button
        type="button"
        className={classNames(
          className,
          'flex items-center cursor-pointer focus-outline w-full',
          sidebarExpanded ? 'rounded-12 p-3' : 'rounded-10',
        )}
        onClick={() => setShowRanksModal(true)}
      >
        <RankProgress
          progress={showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress}
          rank={showRankAnimation ? nextRank : rank}
          nextRank={nextRank}
          showRankAnimation={showRankAnimation}
          showRadialProgress={sidebarExpanded}
          fillByDefault
          onRankAnimationFinish={() =>
            setTimeout(() => confirmLevelUp(true), 1000)
          }
          showTextProgress={sidebarExpanded}
          smallVersion
          rankLastWeek={rankLastWeek}
        />
      </button>
      {showRanksModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showRanksModal}
          onRequestClose={closeRanksModal}
          onShowAccount={() => setShowAccountDetails(true)}
          reads={reads}
          devCardLimit={devCardLimit}
        />
      )}
      {levelUp && shouldShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && shouldShowRankModal}
          onRequestClose={confirmLevelUp}
          showDevCard={reads >= devCardLimit || !devCardLimit}
        />
      )}
      {showAccountDetails && (
        <AccountDetailsModal
          isOpen={showAccountDetails}
          onRequestClose={() => setShowAccountDetails(false)}
        />
      )}
    </>
  );
}
