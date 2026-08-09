import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { DealBrand, DealMedia } from '../types';
import { DealMediaKind } from '../types';
import { getDealMediaCaption } from '../dealsFormat';
import { DealBrandLogo } from './DealBrandLogo';

interface DealCoverImageProps {
  media: DealMedia;
  brand: DealBrand;
  isMuted?: boolean;
  isEager?: boolean;
  showCaption?: boolean;
  /** Fires when the photo dies and the slot falls back to the brand mark, so a
   * surface that also prints the mark can drop its own copy of it. */
  onFallback?: () => void;
  className?: string;
}

export const DealCoverImage = ({
  media,
  brand,
  isMuted,
  isEager,
  showCaption,
  onFallback,
  className,
}: DealCoverImageProps): ReactElement => {
  const [hasFailed, setHasFailed] = useState(false);
  const isArtwork = media.kind === DealMediaKind.Artwork;

  const frame = (
    <div
      className={classNames(
        'relative w-full shrink-0 overflow-hidden rounded-12',
        isArtwork ? 'bg-white' : 'bg-surface-float',
        isMuted && 'grayscale',
        className,
      )}
    >
      {isArtwork && brand.accent && (
        <span
          className="absolute inset-0"
          style={{ backgroundColor: `${brand.accent}1F` }}
        />
      )}
      {hasFailed ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <DealBrandLogo brand={brand} isMuted={isMuted} />
        </span>
      ) : (
        <img
          src={media.imageUrl}
          alt={media.alt}
          loading={isEager ? 'eager' : 'lazy'}
          onError={() => {
            setHasFailed(true);
            onFallback?.();
          }}
          className={classNames(
            'relative size-full',
            isArtwork ? 'object-contain p-4' : 'object-cover',
          )}
        />
      )}
    </div>
  );

  // Once the photo is gone the slot holds a brand mark, and a "photo shows the
  // product family" note or a Wikimedia credit would describe nothing on screen.
  const caption = showCaption && !hasFailed ? getDealMediaCaption(media) : '';

  if (!caption) {
    return frame;
  }

  return (
    <figure className="flex flex-col gap-1">
      {frame}
      <figcaption className="text-text-quaternary typo-caption1">
        {caption}
      </figcaption>
    </figure>
  );
};
