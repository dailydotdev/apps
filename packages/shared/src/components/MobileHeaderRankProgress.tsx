import React, { CSSProperties, ReactElement } from 'react';
import useReadingRank from '../hooks/useReadingRank';
import RankProgressWrapper from './RankProgressWrapper';
import { rankToColor } from '../lib/rank';

export default function MobileHeaderRankProgress(): ReactElement {
  const { isLoading, rank, nextRank } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  return (
    <div
      className=""
      style={
        {
          '--rank-color': rankToColor(nextRank || rank),
        } as CSSProperties
      }
    >
      <RankProgressWrapper />
    </div>
  );
}
