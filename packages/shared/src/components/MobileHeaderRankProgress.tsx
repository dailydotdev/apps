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
import SettingsContext from '../contexts/SettingsContext';

interface WrapperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
const Wrapper = ({ children, ...props }: WrapperProps) => {
  return (
    <div className="block laptop:hidden w-8 h-8" {...props}>
      {children}
    </div>
  );
};

interface MobileHeaderRankProgressProps {
  sidebarRendered: boolean;
}
export default function MobileHeaderRankProgress({
  sidebarRendered,
}: MobileHeaderRankProgressProps): ReactElement {
  const { isLoading, rank, nextRank } = useReadingRank();
  const { optOutWeeklyGoal } = useContext(SettingsContext);

  if (sidebarRendered || optOutWeeklyGoal) {
    return <></>;
  }

  if (isLoading) {
    return <Wrapper>&nbsp;</Wrapper>;
  }

  return (
    <Wrapper
      style={
        {
          '--rank-color': rankToColor(nextRank || rank),
        } as CSSProperties
      }
    >
      <RankProgressWrapper />
    </Wrapper>
  );
}
