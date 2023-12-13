import React from 'react';

export interface CombinedClicks {
  onAuxClick: React.MouseEventHandler<HTMLAnchorElement>;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
}

export const combinedClicks = (
  func: React.MouseEventHandler,
): CombinedClicks => {
  return {
    onAuxClick: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
