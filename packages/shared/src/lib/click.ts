import React from 'react';

type CombinedClicks = {
  onMouseUp: React.MouseEventHandler<HTMLAnchorElement>;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
};
export const combinedClicks = (
  func: React.MouseEventHandler,
): CombinedClicks => {
  return {
    onMouseUp: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
