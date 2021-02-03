/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { ReactElement } from 'react';
import { sizeN } from '../styles/sizes';
import RankProgress from './RankProgress';
import useReadingRank from '../lib/useReadingRank';

export const headerRankHeight = sizeN(18);

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
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
    <div
      className={className}
      css={css`
        display: flex;
        width: ${headerRankHeight};
        height: ${headerRankHeight};
        align-items: center;
        justify-content: center;
        background: var(--theme-background-primary);
      `}
    >
      <RankProgress
        progress={progress}
        rank={rank}
        showRankAnimation={levelUp && neverShowRankModal}
        onRankAnimationFinish={confirmLevelUp}
      />
    </div>
  );
}
