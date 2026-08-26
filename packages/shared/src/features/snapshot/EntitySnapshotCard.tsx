import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import {
  SnapshotStat,
  SnapshotStatRow,
  SnapshotStatValue,
} from './SnapshotStats';

const MUTED = colors.salt['90'];

export type SnapshotEntityKind = 'tag' | 'source' | 'squad';

const KIND_LABEL: Record<SnapshotEntityKind, string> = {
  tag: 'Topic',
  source: 'Source',
  squad: 'Squad',
};

export interface SnapshotEntityStat {
  value: number;
  label: string;
}

export interface EntitySnapshotCardProps {
  kind: SnapshotEntityKind;
  name: string;
  handle?: string;
  description?: string;
  image?: string;
  stats: SnapshotEntityStat[];
  seed?: string;
}

function EntitySnapshotCardComponent(
  {
    kind,
    name,
    handle,
    description,
    image,
    stats,
    seed,
  }: EntitySnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const isTag = kind === 'tag';

  return (
    <SnapshotFrame ref={ref} seed={seed ?? name}>
      <div className="flex flex-1 flex-col items-center text-center">
        <span
          className="font-bold uppercase"
          style={{
            color: colors.cabbage['10'],
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          {KIND_LABEL[kind]}
        </span>

        <div className="mt-7">
          {isTag || !image ? (
            <span
              className="flex items-center justify-center font-bold text-white"
              style={{
                width: 168,
                height: 168,
                borderRadius: 40,
                fontSize: 84,
                background: 'rgba(177, 75, 215, 0.16)',
                border: '1px solid rgba(177, 75, 215, 0.42)',
              }}
            >
              #
            </span>
          ) : (
            <img
              src={image}
              alt=""
              crossOrigin="anonymous"
              className="block object-cover"
              style={{ width: 168, height: 168, borderRadius: 40 }}
            />
          )}
        </div>

        <h1
          className="snapshot-copy mt-6 font-bold text-white"
          style={{ fontSize: 58, lineHeight: 1.12, letterSpacing: '-0.01em' }}
        >
          {isTag ? `#${name}` : name}
        </h1>
        {handle && (
          <span className="mt-1" style={{ color: MUTED, fontSize: 28 }}>
            {handle}
          </span>
        )}

        {description && (
          <p
            className="mt-5"
            style={{ color: MUTED, fontSize: 28, lineHeight: 1.45 }}
          >
            {description}
          </p>
        )}

        <SnapshotStatRow>
          {stats.slice(0, 3).map((stat) => (
            <SnapshotStat
              key={stat.label}
              label={stat.label}
              value={
                <SnapshotStatValue>
                  {largeNumberFormat(stat.value) ?? stat.value}
                </SnapshotStatValue>
              }
            />
          ))}
        </SnapshotStatRow>
      </div>
    </SnapshotFrame>
  );
}

export const EntitySnapshotCard = forwardRef(EntitySnapshotCardComponent);
