import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { ButtonVariant } from '../../components/buttons/common';
import { ButtonSize } from '../../components/buttons/common';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { Post } from '../../graphql/posts';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { snapshotSource } from './snapshotSource';
import { useArmedCard } from './useArmedCard';

/**
 * The TLDR as an image. It is the one piece of a post already written to be
 * read on its own, so it carries further as a card than as a paste of text —
 * and the card names the source, which a bare quote in a thread does not.
 *
 * The card is staged off-screen at its full 1080px because the capture reads
 * the live DOM: it has to be mounted before the press, not after.
 */
export function SummarySnapshotButton({
  post,
  summary,
  // Quieter than the body copy it trails: it runs in at the end of the
  // summary's last line and must not break the paragraph's colour.
  className = 'ml-1 align-middle !text-text-quaternary',
  showLabel = false,
  size = ButtonSize.XSmall,
  variant,
}: {
  post: Post;
  summary: string;
  className?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();

  return (
    <>
      {/* The span carries the arming handlers: Button forwards neither, and
          wrapping is cheaper than widening its props for one caller. */}
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          className={className}
          filename={`daily-summary-${post.id}`}
          showLabel={showLabel}
          size={size}
          target={cardRef}
          variant={variant}
        />
      </span>
      {isArmed && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-300vw] top-0"
        >
          <HighlightTextSnapshotCard
            ref={cardRef}
            seed={post.id}
            source={snapshotSource(post)}
            text={summary}
          />
        </div>
      )}
    </>
  );
}
