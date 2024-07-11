import React, { ReactElement } from 'react';
import { SharedCardCover, SharedCardCoverProps } from './SharedCardCover';

export function CardCover(props: SharedCardCoverProps): ReactElement {
  return (
    <SharedCardCover
      {...props}
      renderOverlay={({ overlay, image }) => (
        <div className="pointer-events-none relative flex flex-1">
          {overlay}
          {image}
        </div>
      )}
    />
  );
}
