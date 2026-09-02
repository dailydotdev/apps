import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface AwardSnapshotCardProps {
  /** The recipient — the card is theirs to share. */
  user: Omit<SnapshotIdentityProps, 'label'>;
  /** Who sent it. Named, because that is the whole point of this moment. */
  from: string;
  award: string;
  emoji?: string;
  image?: string;
  /** What the award was given for, e.g. a post or comment title. */
  reason?: string;
  /** How many of this award the recipient now holds. */
  total?: number;
  seed?: string;
}

/**
 * Being awarded, for #6581 — the one status moment that comes from someone
 * else rather than from your own activity. The sender is on the card because a
 * gift with no giver reads as a self-congratulation.
 */
function AwardSnapshotCardComponent(
  {
    user,
    from,
    award,
    emoji,
    image,
    reason,
    total,
    seed,
  }: AwardSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? `award-${award}`} watermark={emoji}>
      <div className="flex flex-1 flex-col">
        <SnapshotIdentity {...user} label="Awarded" />

        <div className="flex flex-1 flex-col justify-center">
          {image ? (
            <img
              src={image}
              alt=""
              crossOrigin="anonymous"
              className="block object-contain"
              style={{ width: 200, height: 200 }}
            />
          ) : (
            emoji && (
              <span style={{ fontSize: 168, lineHeight: 1 }}>{emoji}</span>
            )
          )}

          <span
            className="mt-6 font-bold text-white"
            style={{ fontSize: 66, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {award}
          </span>
          <span
            className="mt-3"
            style={{ color: colors.cabbage['10'], fontSize: 30 }}
          >
            from {from}
          </span>
          {reason && (
            <span
              className="snapshot-copy mt-6"
              style={{ color: MUTED, fontSize: 28, lineHeight: 1.35 }}
            >
              {reason}
            </span>
          )}
        </div>

        {total !== undefined && (
          <div style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}>
            <span style={{ color: MUTED, fontSize: 26 }}>
              {total} awards received
            </span>
          </div>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const AwardSnapshotCard = forwardRef(AwardSnapshotCardComponent);
