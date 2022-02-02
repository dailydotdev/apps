import React, {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import classnames from 'classnames';
import useReadingRank from '../hooks/useReadingRank';
import RankProgressWrapper from './RankProgressWrapper';
import { rankToColor } from '../lib/rank';

interface WrapperProps extends HTMLAttributes<HTMLLIElement> {
  sidebarExpanded: boolean;
  children?: ReactNode;
}
const Wrapper = ({ sidebarExpanded, children, ...props }: WrapperProps) => {
  return (
    <li
      data-testid="sidebarRankProgressWrapper"
      className={classnames(
        'flex items-center mt-4',
        sidebarExpanded ? 'px-3 h-16' : 'px-1.5 h-8',
      )}
      {...props}
    >
      {children}
    </li>
  );
};

export default function SidebarRankProgress({
  sidebarExpanded,
}: {
  sidebarExpanded?: boolean;
}): ReactElement {
  const { isLoading, rank, nextRank } = useReadingRank();

  if (isLoading) {
    return (
      <Wrapper aria-busy={isLoading} sidebarExpanded={sidebarExpanded}>
        &nbsp;
      </Wrapper>
    );
  }

  return (
    <Wrapper
      sidebarExpanded={sidebarExpanded}
      style={
        {
          '--rank-color': rankToColor(nextRank || rank),
        } as CSSProperties
      }
    >
      <RankProgressWrapper
        sidebarExpanded={sidebarExpanded}
        className="border border-theme-rank bg-theme-bg-secondary"
      />
    </Wrapper>
  );
}
