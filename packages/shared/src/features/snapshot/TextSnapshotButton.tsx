import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ButtonVariant } from '../../components/buttons/common';
import { ButtonSize } from '../../components/buttons/common';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { Post } from '../../graphql/posts';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { snapshotSource } from './snapshotSource';
import { useArmedCard } from './useArmedCard';

/**
 * A passage of the post as an image: the TLDR, or one paragraph of a body.
 * Prose written to be read on its own carries further as a card than as a
 * paste of text, and the card names the source, which a bare quote pasted
 * into a thread does not.
 *
 * The card is staged off-screen at its full 1080px because the capture reads
 * the live DOM: it has to be mounted before the press, not after. It is
 * portalled to the body rather than rendered where the button sits: the button
 * trails prose, and a card left inside that prose would be a `div` inside a
 * `p`, and would fold its own copy of the passage into the paragraph's
 * `textContent` — which is what ParagraphSnapshotButtons reads to decide what
 * each button captures.
 */
export function TextSnapshotButton({
  post,
  text,
  filename,
  // Quieter than the body copy it trails: it runs in at the end of the
  // passage's last line and must not break the paragraph's colour.
  className = 'ml-1 align-middle !text-text-quaternary',
  showLabel = false,
  size = ButtonSize.XSmall,
  variant,
}: {
  post: Post;
  text: string;
  /** Distinguishes a summary from a paragraph in the reader's downloads. */
  filename: string;
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
          filename={filename}
          showLabel={showLabel}
          size={size}
          target={cardRef}
          variant={variant}
        />
      </span>
      {isArmed &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed left-[-300vw] top-0"
          >
            <HighlightTextSnapshotCard
              passage={text}
              ref={cardRef}
              seed={post.id}
              source={snapshotSource(post)}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
