import React, { CSSProperties, ReactElement } from 'react';
import useReadingRank from '../hooks/useReadingRank';
import RankProgressWrapper from './RankProgressWrapper';
import { rankToColor } from '../lib/rank';

export default function SidebarRankProgress({
  openSidebar,
}: {
  openSidebar?: boolean;
}): ReactElement {
  const { isLoading, rank, nextRank } = useReadingRank();

  if (isLoading) {
    return <li className={`flex ${openSidebar ? 'h-20' : 'h-12'}`}>&nbsp;</li>;
  }

  return (
    <li
      className={`flex items-center mt-4 ${openSidebar ? 'px-3' : 'px-1.5'}`}
      style={
        {
          '--rank-color': rankToColor(nextRank || rank),
        } as CSSProperties
      }
    >
      <RankProgressWrapper
        openSidebar={openSidebar}
        className="border border-theme-rank bg-theme-bg-secondary"
      />
    </li>
  );
}
