import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib/numberFormat';
import { SnapshotFrame } from './SnapshotFrame';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';
import {
  SnapshotStat,
  SnapshotStatRow,
  SnapshotStatValue,
} from './SnapshotStats';

const MUTED = colors.salt['90'];

export interface PluginSnapshotCardProps {
  name: string;
  description: string;
  author: SnapshotIdentityProps;
  upvotes: number;
  awards: number;
  added: string;
  seed: string;
}

function PluginSnapshotCardComponent(
  {
    name,
    description,
    author,
    upvotes,
    awards,
    added,
    seed,
  }: PluginSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame
      logoAside={<SnapshotEyebrow label="Plugin" />}
      ref={ref}
      seed={seed}
    >
      <div className="flex flex-1 flex-col">
        <span
          className="snapshot-copy break-words font-bold text-white"
          style={{
            fontSize: 46,
            lineHeight: 1.15,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {name}
        </span>

        <p
          className="mt-8"
          style={{
            color: MUTED,
            fontSize: 30,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        <div className="mt-8">
          <SnapshotIdentity {...author} />
        </div>

        <div className="mt-auto pt-8">
          <SnapshotStatRow>
            <SnapshotStat
              label="Upvotes"
              value={
                <SnapshotStatValue>
                  {largeNumberFormat(upvotes) ?? upvotes}
                </SnapshotStatValue>
              }
            />
            <SnapshotStat
              label="Awards"
              value={
                <SnapshotStatValue>
                  {largeNumberFormat(awards) ?? awards}
                </SnapshotStatValue>
              }
            />
            <SnapshotStat
              label="Added"
              value={<SnapshotStatValue compact>{added}</SnapshotStatValue>}
            />
          </SnapshotStatRow>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const PluginSnapshotCard = forwardRef(PluginSnapshotCardComponent);
