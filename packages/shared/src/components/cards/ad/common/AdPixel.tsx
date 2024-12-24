import type { ReactElement } from 'react';
import React from 'react';
import type { Ad } from '../../../../graphql/posts';

export const AdPixel = ({ pixel }: Pick<Ad, 'pixel'>): ReactElement => {
  return (
    <>
      {pixel?.map((p) => (
        <img
          src={p}
          key={p}
          data-testid="pixel"
          className="hidden size-0"
          alt="Pixel"
        />
      ))}
    </>
  );
};
