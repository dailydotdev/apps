import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { DealBrand } from '../types';
import { DealBrandLogo } from './DealBrandLogo';

interface DealBrandCoverProps {
  brand: DealBrand;
  isMuted?: boolean;
  className?: string;
}

/**
 * The cover slot for an offer with no product photo. CSS Grid stretches every
 * card in a row to the tallest sibling, so a card that skips the cover ends up
 * holding a void next to one that has it. A brand led cover is the honest way
 * to fill it: the mark the reader is looking for, on its own colour.
 */
export const DealBrandCover = ({
  brand,
  isMuted,
  className,
}: DealBrandCoverProps): ReactElement => (
  <div
    aria-hidden
    className={classNames(
      'relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-12 bg-surface-float',
      isMuted && 'grayscale',
      className,
    )}
  >
    {brand.accent && (
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${brand.accent}2E, ${brand.accent}0A)`,
        }}
      />
    )}
    <span className="relative size-12">
      <DealBrandLogo brand={brand} isMuted={isMuted} isThumbnail />
    </span>
  </div>
);
