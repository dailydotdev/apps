import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type {
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { Post } from '../../graphql/posts';
import { PollSnapshotCard } from './PollSnapshotCard';
import { pollSnapshotFromPost } from './pollSnapshot';
import { SNAPSHOT_SIZE } from './snapshotGradient';

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

/**
 * A poll result is the one post payload an image carries better than the link:
 * a bar chart is self-contained, and the URL is worth nothing once voting
 * closes. The card is staged off-screen at its full 1080px because the capture
 * reads the live DOM — it has to be mounted before the press, not after.
 */
export function PollSnapshotButton({
  post,
  showLabel,
  size,
  variant,
}: {
  post: Post;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}): ReactElement | null {
  const cardRef = useRef<HTMLDivElement>(null);
  const snapshot = pollSnapshotFromPost(post);

  if (!snapshot) {
    return null;
  }

  return (
    <>
      <SnapshotButton
        captureOptions={CAPTURE_OPTIONS}
        filename={`daily-poll-${post.id}`}
        showLabel={showLabel}
        size={size}
        target={cardRef}
        variant={variant}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <PollSnapshotCard ref={cardRef} {...snapshot} />
      </div>
    </>
  );
}
