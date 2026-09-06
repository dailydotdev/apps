import type { ReactElement } from 'react';
import React from 'react';
import type { HotTake } from '../../graphql/user/userHotTake';
import { SnapshotFrame } from './SnapshotFrame';
import { HOT_TAKE_EYEBROW_GRADIENT, SnapshotContent } from './SnapshotContent';

/**
 * The take is the whole payload, so the card carries the opinion rather than
 * the row it was read in: no avatar, and the upvote count reads as agreement
 * rather than a score.
 */
export const HotTakeSnapshotCard = ({
  take,
}: {
  take: HotTake;
}): ReactElement => (
  <SnapshotFrame seed={take.id} watermark={take.emoji}>
    <SnapshotContent
      body={take.subtitle ?? undefined}
      bodyLines={3}
      eyebrow="Hot take"
      eyebrowGradient={HOT_TAKE_EYEBROW_GRADIENT}
      stat={
        take.upvotes > 0
          ? { value: `${take.upvotes}`, label: 'found this hot' }
          : undefined
      }
      statVariant="inline"
      title={take.title}
      titleLines={3}
    />
  </SnapshotFrame>
);
