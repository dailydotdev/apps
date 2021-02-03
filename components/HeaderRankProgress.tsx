/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { ReactElement, useState } from 'react';
import RankProgress from './RankProgress';
import useReadingRank from '../lib/useReadingRank';
import { useHideOnModal } from '../lib/useHideOnModal';
import { headerRankHeight } from '../styles/sizes';
import dynamic from 'next/dynamic';
import { focusOutline } from '../styles/helpers';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "reactModal" */ './modals/RanksModal'),
);

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const [showModal, setShowModal] = useState(false);
  useHideOnModal(() => showModal, [showModal]);

  const {
    isLoading,
    rank,
    progress,
    neverShowRankModal,
    levelUp,
    confirmLevelUp,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  return (
    <button
      className={className}
      css={css`
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
      `}
      onClick={() => setShowModal(true)}
    >
      <RankProgress
        progress={progress}
        rank={rank}
        showRankAnimation={levelUp && neverShowRankModal}
        onRankAnimationFinish={confirmLevelUp}
      />
      {showModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
        />
      )}
    </button>
  );
}
