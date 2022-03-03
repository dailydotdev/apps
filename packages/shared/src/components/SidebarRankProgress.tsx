import React, {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import classnames from 'classnames';
import useReadingRank from '../hooks/useReadingRank';
import RankProgressWrapper, {
  RankProgressWrapperProps,
} from './RankProgressWrapper';
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
  disableNewRankPopup,
  sidebarExpanded,
}: RankProgressWrapperProps): ReactElement {
  const { isLoading, rank, nextRank } = useReadingRank(disableNewRankPopup);
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
        disableNewRankPopup={disableNewRankPopup}
        className="border border-theme-rank bg-theme-bg-secondary"
      />
    </Wrapper>
  );
}
