import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];
const CHIP_BORDER = colors.pepper['20'];

export interface FeedSnapshotCardProps {
  user: Omit<SnapshotIdentityProps, 'label'>;
  /** The feed's own name, which the recipient can rename once it is theirs. */
  name: string;
  tags: string[];
  sources: number;
  /** Total tags on the feed; `tags` is only the handful that fit the card. */
  tagCount: number;
  seed?: string;
}

/**
 * A custom feed, for #6579. The card carries the recipe — tags and source
 * count — rather than any posts: the feed is a standing filter, and a still
 * frame of today's posts would misrepresent what the recipient is adding.
 */
function FeedSnapshotCardComponent(
  { user, name, tags, sources, tagCount, seed }: FeedSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? `feed-${name}`}>
      <div className="flex flex-1 flex-col">
        <SnapshotIdentity {...user} label="Shared a feed" />

        <div className="flex flex-1 flex-col justify-center">
          <span
            className="snapshot-copy font-bold text-white"
            style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {name}
          </span>

          <div className="mt-8 flex flex-wrap" style={{ gap: 14 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-bold text-white"
                style={{
                  fontSize: 26,
                  padding: '10px 22px',
                  borderRadius: 999,
                  border: `1px solid ${CHIP_BORDER}`,
                }}
              >
                #{tag}
              </span>
            ))}
            {tagCount > tags.length && (
              <span
                style={{
                  color: MUTED,
                  fontSize: 26,
                  padding: '10px 22px',
                }}
              >
                +{tagCount - tags.length} more
              </span>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-8"
          style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
        >
          <span style={{ color: MUTED, fontSize: 26 }}>{tagCount} tags</span>
          <span style={{ color: MUTED, fontSize: 26 }}>{sources} sources</span>
          <span style={{ color: MUTED, fontSize: 26 }}>
            Opens as your own feed
          </span>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const FeedSnapshotCard = forwardRef(FeedSnapshotCardComponent);
