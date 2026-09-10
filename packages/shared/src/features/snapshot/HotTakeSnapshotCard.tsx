import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { HotTake } from '../../graphql/user/userHotTake';
import colors from '../../styles/colors';
import type { SnapshotCreditProps } from './SnapshotCredit';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];

/** Fire, for a take that ran hot: yellow core through orange into red. */
export const HOT_TAKE_EYEBROW_GRADIENT = `linear-gradient(100deg, ${colors.cheese['40']} 0%, ${colors.ketchup['10']} 48%, ${colors.ketchup['50']} 100%)`;

interface HotTakeSnapshotCardProps {
  take: HotTake;
  /**
   * Who wrote the take. Anyone can share it, so without the credit the image
   * reads as the sharer's own opinion.
   */
  author?: SnapshotCreditProps;
}

/**
 * The take is the whole payload, so the card carries the opinion rather than
 * the row it was read in, and the upvote count reads as agreement rather than
 * a score. Title and subtitle are set as one statement: split across two type
 * styles they read as two voices arguing the same point.
 */
function HotTakeSnapshotCardComponent(
  { take, author }: HotTakeSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame
      grow
      logoAside={
        <SnapshotEyebrow
          gradient={HOT_TAKE_EYEBROW_GRADIENT}
          label="Hot take"
        />
      }
      ref={ref}
      seed={take.id}
      watermark={take.emoji}
    >
      <h1
        className="snapshot-copy text-center font-bold text-white"
        style={{ fontSize: 56, lineHeight: 1.15 }}
      >
        {[take.title, take.subtitle].filter(Boolean).join(' ')}
      </h1>
      {take.upvotes > 0 && (
        <div
          className="mt-auto flex items-baseline justify-center gap-2"
          style={{ fontSize: 28 }}
        >
          <span className="font-bold" style={{ color: colors.cabbage['10'] }}>
            {take.upvotes}
          </span>
          <span style={{ color: MUTED }}>found this hot</span>
        </div>
      )}
      {author?.name && (
        <SnapshotCredit image={author.image} name={author.name} />
      )}
    </SnapshotFrame>
  );
}

export const HotTakeSnapshotCard = forwardRef(HotTakeSnapshotCardComponent);
