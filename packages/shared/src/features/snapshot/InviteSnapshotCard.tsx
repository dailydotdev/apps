import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface InviteSnapshotCardProps {
  name: string;
  handle: string;
  image?: string;
  headline: string;
  perk?: string;
  link: string;
  seed?: string;
}

function InviteSnapshotCardComponent(
  { name, handle, image, headline, perk, link, seed }: InviteSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? handle}>
      <div className="flex flex-1 flex-col items-center text-center">
        {image && (
          <img
            src={image}
            alt=""
            crossOrigin="anonymous"
            className="block object-cover"
            style={{ width: 168, height: 168, borderRadius: 40 }}
          />
        )}

        <span
          className="mt-5 font-bold text-white"
          style={{ fontSize: 34, lineHeight: 1.2 }}
        >
          {name}
        </span>
        <span style={{ color: MUTED, fontSize: 26 }}>{handle}</span>

        <h1
          className="snapshot-copy mt-8 font-bold text-white"
          style={{ fontSize: 60, lineHeight: 1.15, letterSpacing: '-0.01em' }}
        >
          {headline}
        </h1>

        {perk && (
          <span
            className="mt-6 font-bold"
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              fontSize: 28,
              color: colors.cabbage['10'],
              background: 'rgba(177, 75, 215, 0.16)',
              border: `1px solid rgba(177, 75, 215, 0.42)`,
            }}
          >
            {perk}
          </span>
        )}

        <div
          className="mt-auto w-full"
          style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
        >
          <span
            className="font-bold text-white"
            style={{ fontSize: 30, lineHeight: 1.3 }}
          >
            {link}
          </span>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const InviteSnapshotCard = forwardRef(InviteSnapshotCardComponent);
