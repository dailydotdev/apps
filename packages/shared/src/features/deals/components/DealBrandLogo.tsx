import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import type { DealBrand } from '../types';
import {
  DealBrandMarkKind,
  getDealBrandIconSources,
  getDealBrandTileStyle,
  getMonogram,
} from '../dealsFormat';

export enum DealBrandTileSize {
  /** 32px, the mark pinned to the corner of a cover photo. */
  Badge = 'badge',
  /** 40px, the card header, the wallet row and the similar deals list. */
  Chip = 'chip',
  /** 56px, the brand led cover on a grid card. */
  Cover = 'cover',
  /** 64px on mobile and 80px from tablet up, the directory row thumbnail. */
  Thumbnail = 'thumbnail',
}

const sizeToBox: Record<DealBrandTileSize, string> = {
  [DealBrandTileSize.Badge]: 'size-8',
  [DealBrandTileSize.Chip]: 'size-10',
  [DealBrandTileSize.Cover]: 'size-14',
  [DealBrandTileSize.Thumbnail]: 'size-16 tablet:size-20',
};

/**
 * The mark takes a bigger share of a smaller tile, because the fixed padding
 * that reads as clearspace at 80px reads as a mark shrinking away at 32px.
 */
const sizeToMarkRatio: Record<DealBrandTileSize, number> = {
  [DealBrandTileSize.Badge]: 75,
  [DealBrandTileSize.Chip]: 70,
  [DealBrandTileSize.Cover]: 66,
  [DealBrandTileSize.Thumbnail]: 60,
};

/**
 * A site icon is already drawn as a tile with its own padding baked in, so the
 * clearspace it needs from us is smaller. A wordmark instead needs width the
 * square ratio would not give it.
 */
const FAVICON_SCALE = 1.24;

const VECTOR_WIDTH_SCALE = 1.18;

const MAX_MARK_RATIO = 92;

const MONOGRAM_VIEWBOX = 40;

const getMarkSize = (
  size: DealBrandTileSize,
  kind: DealBrandMarkKind,
): { width: string; height: string } => {
  const ratio = sizeToMarkRatio[size];
  const height =
    kind === DealBrandMarkKind.Favicon ? ratio * FAVICON_SCALE : ratio;
  const width =
    kind === DealBrandMarkKind.Vector ? height * VECTOR_WIDTH_SCALE : height;

  return {
    width: `${Math.min(MAX_MARK_RATIO, width)}%`,
    height: `${Math.min(MAX_MARK_RATIO, height)}%`,
  };
};

interface DealBrandLogoProps {
  brand: DealBrand;
  isMuted?: boolean;
  size?: DealBrandTileSize;
  className?: string;
}

export const DealBrandLogo = ({
  brand,
  isMuted,
  size = DealBrandTileSize.Chip,
  className,
}: DealBrandLogoProps): ReactElement => {
  const sources = getDealBrandIconSources(brand);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasMarkPainted, setHasMarkPainted] = useState(false);
  const source = sources[sourceIndex];
  const tile = getDealBrandTileStyle(brand);
  const monogram = getMonogram(brand.name);

  // A cached mark can finish loading before hydration attaches the handler, and
  // the placeholder would then never step aside.
  const onMarkMount = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) {
      setHasMarkPainted(true);
    }
  }, []);

  const onMarkFailed = useCallback(() => {
    setHasMarkPainted(false);
    setSourceIndex((current) => current + 1);
  }, []);

  return (
    <span
      className={classNames(
        'brand-tile relative flex shrink-0 items-center justify-center overflow-hidden',
        sizeToBox[size],
        isMuted && 'grayscale',
        className,
      )}
      style={{ background: tile.background, boxShadow: tile.boxShadow }}
    >
      {!hasMarkPainted && (
        <svg
          viewBox={`0 0 ${MONOGRAM_VIEWBOX} ${MONOGRAM_VIEWBOX}`}
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <text
            x="50%"
            y="50%"
            dy="0.35em"
            textAnchor="middle"
            fontSize={monogram.length > 1 ? 15 : 20}
            fontWeight="700"
            fill={tile.ink}
          >
            {monogram}
          </text>
        </svg>
      )}
      {source && (
        <img
          key={source.url}
          ref={onMarkMount}
          src={source.url}
          alt=""
          aria-hidden
          loading="lazy"
          onLoad={() => setHasMarkPainted(true)}
          onError={onMarkFailed}
          style={getMarkSize(size, source.kind)}
          className={classNames(
            'relative object-contain',
            !hasMarkPainted && 'opacity-0',
          )}
        />
      )}
    </span>
  );
};
