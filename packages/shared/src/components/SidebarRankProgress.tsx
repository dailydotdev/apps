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
import { rankToColor, STEPS_PER_RANK } from '../lib/rank';
import FeaturesContext from '../contexts/FeaturesContext';
import { getFeatureValue } from '../lib/featureManagement';

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

export default function SidebarRankProgress({
  openSidebar,
}: {
  openSidebar?: boolean;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { flags } = useContext(FeaturesContext);
  const devCardLimit = parseInt(
    getFeatureValue('feat_limit_dev_card', flags),
    10,
  );
  const {
    isLoading,
    rank,
    rankLastWeek,
    nextRank,
    progress,
    shouldShowRankModal,
    levelUp,
    confirmLevelUp,
    reads,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  const showRankAnimation = levelUp && !shouldShowRankModal;
  const closeRanksModal = () => {
    setShowRanksModal(false);
  };

  return (
    <>
      <li
        className={`flex items-center mt-4 ${openSidebar ? 'px-3' : 'px-1.5'}`}
        style={
          {
            '--rank-color': rankToColor(nextRank || rank),
          } as CSSProperties
        }
      >
        <button
          type="button"
          className={classNames(
            'flex items-center bg-theme-bg-secondary border border-theme-rank cursor-pointer focus-outline w-full',
            openSidebar ? 'rounded-12 p-3' : 'rounded-10',
          )}
          onClick={() => setShowRanksModal(true)}
        >
          <RankProgress
            progress={
              showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress
            }
            rank={showRankAnimation ? nextRank : rank}
            nextRank={nextRank}
            showRankAnimation={showRankAnimation}
            showRadialProgress={openSidebar}
            fillByDefault
            onRankAnimationFinish={() =>
              setTimeout(() => confirmLevelUp(true), 1000)
            }
            showTextProgress={openSidebar}
            smallVersion
            rankLastWeek={rankLastWeek}
          />
        </button>
      </li>
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
