import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface TopReaderBadge {
  keyword: string;
  earnedAt: string;
}

export interface AwardTally {
  count: number;
  emoji?: string;
  image?: string;
  name: string;
}

export interface BadgesSnapshotCardProps {
  user: Omit<SnapshotIdentityProps, 'label'>;
  topReaderBadges: number;
  totalAwards: number;
  badges: TopReaderBadge[];
  awards: AwardTally[];
  seed?: string;
}

const Tile = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-1 rounded-24"
    style={{
      padding: '20px 16px',
      border: `1px solid ${DIVIDER}`,
      background: 'rgba(255, 255, 255, 0.03)',
    }}
  >
    <span
      className="font-bold text-white"
      style={{ fontSize: 52, lineHeight: 1 }}
    >
      {value}
    </span>
    <span style={{ color: MUTED, fontSize: 24, lineHeight: 1.3 }}>{label}</span>
  </div>
);

function BadgesSnapshotCardComponent(
  {
    user,
    topReaderBadges,
    totalAwards,
    badges,
    awards,
    seed,
  }: BadgesSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? 'badges'}>
      <div className="flex flex-1 flex-col gap-6">
        <SnapshotIdentity {...user} label="Badges & awards" />

        <div className="flex gap-4">
          <Tile
            label="Top reader badge"
            value={`x${largeNumberFormat(topReaderBadges) ?? topReaderBadges}`}
          />
          <Tile
            label="Total awards"
            value={`x${largeNumberFormat(totalAwards) ?? totalAwards}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          {badges.slice(0, 4).map((badge) => (
            <div key={badge.keyword} className="flex items-center gap-3">
              <span
                className="truncate rounded-10 text-white"
                style={{
                  padding: '6px 16px',
                  fontSize: 24,
                  border: `1px solid ${DIVIDER}`,
                }}
              >
                {badge.keyword}
              </span>
              <span
                className="ml-auto shrink-0"
                style={{ color: MUTED, fontSize: 24 }}
              >
                {badge.earnedAt}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-auto flex items-end justify-between"
          style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 26 }}
        >
          {awards.slice(0, 6).map((award) => (
            <div
              key={award.name}
              className="flex flex-col items-center gap-2"
              style={{ width: 92 }}
            >
              {award.image ? (
                <img
                  src={award.image}
                  alt=""
                  crossOrigin="anonymous"
                  className="block object-contain"
                  style={{ width: 58, height: 58 }}
                />
              ) : (
                <span style={{ fontSize: 54, lineHeight: 1 }}>
                  {award.emoji}
                </span>
              )}
              <span
                className="font-bold text-white"
                style={{ fontSize: 24, lineHeight: 1 }}
              >
                x{award.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const BadgesSnapshotCard = forwardRef(BadgesSnapshotCardComponent);
