import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { DealBrand } from '../types';
import { getDealBrandIconSources, getMonogram } from '../dealsFormat';

interface DealBrandLogoProps {
  brand: DealBrand;
  isMuted?: boolean;
  className?: string;
}

export const DealBrandLogo = ({
  brand,
  isMuted,
  className,
}: DealBrandLogoProps): ReactElement => {
  const sources = getDealBrandIconSources(brand);
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sources[sourceIndex];

  return (
    <span
      className={classNames(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-white',
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
          className="size-6 object-contain"
        />
      ) : (
        <span
          className="font-bold typo-footnote"
          style={brand.accent ? { color: brand.accent } : undefined}
        >
          {getMonogram(brand.name)}
        </span>
      )}
    </span>
  );
};
