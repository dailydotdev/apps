import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { AchievementRarityTier } from '../profile/components/achievements/achievementRarity';
import { SnapshotFrame } from './SnapshotFrame';

const CARD_WIDTH = 620;
/** Trading-card proportions (2.5:3.5) rather than a square slab. */
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.4);
const CARD_RADIUS = 36;

/**
 * The Game Center slab treatment: artwork full bleed, a scrim carrying the
 * copy, and gold reserved for the sub-1% band so it means something.
 */
const SCRIM =
  'linear-gradient(to top, rgba(6,8,11,0.94) 0%, rgba(6,8,11,0.72) 34%, rgba(6,8,11,0.12) 66%, rgba(6,8,11,0) 100%)';

const PILL = {
  gold: { background: '#efab27', color: '#08110c' },
  plain: { background: 'rgba(8,10,13,0.72)', color: '#FFFFFF' },
};

export interface AchievementSnapshotCardProps {
  name: string;
  description: string;
  image?: string;
  rarity: number | null;
  tier: AchievementRarityTier | null;
  completedAt: string;
  seed?: string;
}

function AchievementSnapshotCardComponent(
  {
    name,
    description,
    image,
    rarity,
    tier,
    completedAt,
    seed,
  }: AchievementSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const isEmerald = tier === AchievementRarityTier.Emerald;
  const pill = isEmerald ? PILL.gold : PILL.plain;
  const rarityLabel = isEmerald ? '<1%' : `${Math.round(rarity ?? 0)}%`;

  return (
    <SnapshotFrame bare logoPlacement="top-right" ref={ref} seed={seed ?? name}>
      <div
        className="relative flex flex-col justify-end overflow-hidden"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          background: '#12151C',
          boxShadow: '0 48px 96px rgba(4, 2, 9, 0.7)',
        }}
      >
        {image && (
          <img
            src={image}
            alt=""
            crossOrigin="anonymous"
            className="absolute inset-0 block size-full object-cover"
          />
        )}

        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: SCRIM }}
        />

        {tier && (
          <span
            className="absolute font-bold"
            style={{
              left: 26,
              top: 26,
              padding: '9px 20px',
              borderRadius: 999,
              fontSize: 26,
              lineHeight: 1,
              ...pill,
            }}
          >
            {rarityLabel} rare
          </span>
        )}

        <div
          className="relative flex flex-col"
          style={{ padding: '0 34px 34px' }}
        >
          <span
            className="snapshot-copy font-bold text-white"
            style={{ fontSize: 46, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {name}
          </span>
          <span
            style={{
              marginTop: 8,
              color: 'rgba(255,255,255,0.78)',
              fontSize: 28,
              lineHeight: 1.32,
            }}
          >
            {description}
          </span>
          <span
            style={{
              marginTop: 14,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 26,
            }}
          >
            Completed {completedAt}
          </span>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const AchievementSnapshotCard = forwardRef(
  AchievementSnapshotCardComponent,
);
