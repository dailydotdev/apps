import type { ReactElement } from 'react';
import React from 'react';
import type { HotTake } from '../../graphql/user/userHotTake';
import { SnapshotFrame } from './SnapshotFrame';
import { HOT_TAKE_EYEBROW_GRADIENT, SnapshotContent } from './SnapshotContent';
import { SnapshotEyebrow } from './SnapshotEyebrow';

/**
 * The take is the whole payload, so the card carries the opinion rather than
 * the row it was read in: no avatar, and the upvote count reads as agreement
 * rather than a score. Title and subtitle are set as one statement — split
 * across two type styles they read as two voices arguing the same point.
 */
export const HotTakeSnapshotCard = ({
  take,
}: {
  take: HotTake;
}): ReactElement => (
  <SnapshotFrame
    grow
    logoAside={
      <SnapshotEyebrow gradient={HOT_TAKE_EYEBROW_GRADIENT} label="Hot take" />
    }
    seed={take.id}
    watermark={take.emoji}
  >
    <SnapshotContent
      centered
      stat={
        take.upvotes > 0
          ? { value: `${take.upvotes}`, label: 'found this hot' }
          : undefined
      }
      statVariant="inline"
      title={[take.title, take.subtitle].filter(Boolean).join(' ')}
      titleLines={0}
    />
  </SnapshotFrame>
);
