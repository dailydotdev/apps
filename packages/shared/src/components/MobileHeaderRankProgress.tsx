import React, {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import useReadingRank from '../hooks/useReadingRank';
import RankProgressWrapper from './RankProgressWrapper';
import { rankToColor } from '../lib/rank';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';

interface WrapperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
const Wrapper = ({ children, ...props }: WrapperProps) => {
  return (
    <div className="w-8 h-8" {...props}>
      {children}
    </div>
  );
};

export default function MobileHeaderRankProgress(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { isLoading, rank, nextRank } = useReadingRank();

  if (isLoading && !windowLoaded) {
    return <Wrapper>&nbsp;</Wrapper>;
  }

  return (
    windowLoaded && (
      <Wrapper
        style={
          {
            '--rank-color': rankToColor(nextRank || rank),
          } as CSSProperties
        }
      >
        <RankProgressWrapper />
      </Wrapper>
    )
  );
}
