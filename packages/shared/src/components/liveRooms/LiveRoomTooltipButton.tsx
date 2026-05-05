import type { ReactElement } from 'react';
import React from 'react';
import { Tooltip } from '../tooltip/Tooltip';

interface LiveRoomTooltipButtonProps {
  tooltip: string;
  children: ReactElement;
  wrapDisabled?: boolean;
}

export const LiveRoomTooltipButton = ({
  tooltip,
  children,
  wrapDisabled = false,
}: LiveRoomTooltipButtonProps): ReactElement => {
  if (wrapDisabled) {
    return (
      <Tooltip content={tooltip}>
        <span className="inline-flex">{children}</span>
      </Tooltip>
    );
  }

  return <Tooltip content={tooltip}>{children}</Tooltip>;
};
