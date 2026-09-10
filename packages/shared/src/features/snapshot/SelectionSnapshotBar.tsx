import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CopyIcon, LinkIcon } from '../../components/icons';
import { CopyStateIcon } from '../../components/share/CopyStateIcon';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import type { Post } from '../../graphql/posts';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { snapshotSource } from './snapshotSource';
import type { TextSelection } from './useTextSelection';
import { useTextSelection } from './useTextSelection';
import { useLogSnapshot } from './useLogSnapshot';

const BAR_HEIGHT = 44;
const GAP = 8;
/** Keeps the bar off the viewport edges when the quote runs to the margin. */
const EDGE = 96;
/** Clears the drag handles Android hangs under the end of a selection. */
const HANDLE = 32;

// Android draws its own Copy/Share menu over the selection, above it whenever
// there is room. Taking the other side leaves both readable: the platform menu
// only moves below the quote in the case where we then sit above it.
const prefersBelow = () =>
  globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;

const clamp = (value: number, min: number, max: number) =>
  // A viewport shorter than the bar's own margins has no valid band, and
  // Math.min/Math.max in the wrong order would put the bar off the far edge.
  max < min ? min : Math.min(Math.max(value, min), max);

const position = (selection: TextSelection) => {
  const above = selection.top - BAR_HEIGHT - GAP;
  const center = selection.left + selection.width / 2;
  const { innerHeight, innerWidth } = globalThis;
  const below = selection.bottom + GAP + (prefersBelow() ? HANDLE : 0);
  const fits = !innerHeight || below + BAR_HEIGHT + GAP <= innerHeight;
  // Below the quote when it starts at the top of the viewport, where there is
  // no room above it.
  const top = above < GAP || (prefersBelow() && fits) ? below : above;

  return {
    // Clamped to the viewport, not just flipped: in the post modal the quote
    // can sit at the bottom of a short scroll area, where the flipped bar
    // would land below the fold. The page's article is tall enough that this
    // never showed there.
    top: innerHeight ? clamp(top, GAP, innerHeight - BAR_HEIGHT - GAP) : top,
    left: innerWidth ? clamp(center, EDGE, innerWidth - EDGE) : center,
  };
};

export function SelectionSnapshotBar({
  post,
  containerRef,
}: {
  post: Post;
  containerRef: RefObject<HTMLElement>;
}): ReactElement | null {
  const barRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(containerRef, true, barRef);
  // The card outlives the bar: pressing Snapshot collapses the selection in
  // some browsers, and the capture still has to find the quote mounted.
  const [quote, setQuote] = useState<TextSelection | null>(null);
  const [linkCopied, copyLink] = useCopyPostLink();
  const [textCopied, copyText] = useCopyText(quote?.text);
  const { logEvent } = useLogContext();

  const onCopyLink = useCallback(() => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: {
          provider: ShareProvider.CopyLink,
          origin: Origin.TextSelection,
        },
      }),
    );
    // `shorten`, not an awaited short URL: the write has to stay inside the
    // task that handled the click or Safari refuses it.
    copyLink({
      link: post.commentsPermalink,
      shorten: true,
      cid: ReferralCampaignKey.SharePost,
      format: (link) => (quote?.text ? `"${quote.text}"\n\n${link}` : link),
      message: '✅ Copied text and link',
    });
  }, [copyLink, logEvent, post, quote]);

  const onCopyText = useCallback(() => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: {
          provider: ShareProvider.CopyText,
          origin: Origin.TextSelection,
        },
      }),
    );
    copyText({ message: '✅ Copied text' });
  }, [copyText, logEvent, post]);

  const logSnapshot = useLogSnapshot(post, Origin.TextSelection);

  useEffect(() => {
    if (selection) {
      setQuote(selection);
    }
  }, [selection]);

  if (!quote || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {selection && (
        <div
          ref={barRef}
          aria-label="Share selected text"
          // z-max, not z-popup: the bar is portaled to the body and the post
          // modal's own overlay is z-modal, so anything lower renders behind
          // the modal the quote was selected in.
          // `!mr-0` because base.css gives every `.fixed` a scrollbar-width
          // margin while a modal is open, to keep full-width chrome from
          // shifting. This bar is placed by an explicit `left`, so that margin
          // only skews it.
          className="fixed z-max !mr-0 inline-flex -translate-x-1/2 items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
          role="toolbar"
          style={position(selection)}
        >
          {/* Snapshot leads, labelled and solid: it is the reason the bar
              exists, and the two copies beside it are the familiar fallbacks. */}
          <SnapshotButton
            onResult={logSnapshot}
            captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
            filename={`daily-quote-${post.id}`}
            target={cardRef}
            variant={ButtonVariant.Primary}
          />
          <Tooltip content="Copy text and link">
            <Button
              aria-label="Copy text and link"
              icon={<CopyStateIcon copied={linkCopied} icon={LinkIcon} />}
              onClick={onCopyLink}
              size={ButtonSize.Small}
              type="button"
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <Tooltip content="Copy text">
            <Button
              aria-label="Copy text"
              icon={<CopyStateIcon copied={textCopied} icon={CopyIcon} />}
              onClick={onCopyText}
              size={ButtonSize.Small}
              type="button"
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
        </div>
      )}

      {/* The card the capture reads from, off-screen at its full 1080px. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <HighlightTextSnapshotCard
          ref={cardRef}
          highlight={quote.highlight}
          passage={quote.passage}
          seed={post.id}
          source={snapshotSource(post)}
        />
      </div>
    </>,
    document.body,
  );
}
