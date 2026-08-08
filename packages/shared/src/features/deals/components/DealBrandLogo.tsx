import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { DealBrand } from '../types';
import { getDealBrandIconSources, getMonogram } from '../dealsFormat';

interface DealBrandLogoProps {
  brand: DealBrand;
  isMuted?: boolean;
  /** Fills its container, for slots where the mark stands in for a product photo. */
  isThumbnail?: boolean;
  className?: string;
}

export const DealBrandLogo = ({
  brand,
  isMuted,
  isThumbnail,
  className,
}: DealBrandLogoProps): ReactElement => {
  const sources = getDealBrandIconSources(brand);
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sources[sourceIndex];

  return (
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-white',
        isThumbnail ? 'size-full' : 'size-10',
        isMuted && 'grayscale',
        className,
      )}
      style={brand.accent ? { borderColor: brand.accent } : undefined}
    >
      {source ? (
        <img
          key={source}
          src={source}
          alt=""
          aria-hidden
          loading="lazy"
          onError={() => setSourceIndex((current) => current + 1)}
          className={classNames(
            'object-contain',
            isThumbnail ? 'size-1/2' : 'size-6',
          )}
        />
      ) : (
        <span
          className={classNames(
            'font-bold',
            isThumbnail ? 'typo-title3' : 'typo-footnote',
          )}
          style={brand.accent ? { color: brand.accent } : undefined}
        >
          {getMonogram(brand.name)}
        </span>
      )}
    </span>
  );
};
