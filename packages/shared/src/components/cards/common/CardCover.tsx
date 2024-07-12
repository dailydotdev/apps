import React, { ReactElement } from 'react';
import { ReusedCardCoverProps, SharedCardCover } from './SharedCardCover';
import { CardImage } from '../Card';

export function CardCover(props: ReusedCardCoverProps): ReactElement {
  return (
    <SharedCardCover
      {...props}
      CardImageComponent={CardImage}
      renderOverlay={({ overlay, image }) => (
        <div className="pointer-events-none relative flex flex-1">
          {overlay}
          {image}
        </div>
      )}
    />
  );
}
