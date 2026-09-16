import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CopyIcon, LinkIcon } from '../../components/icons';
import { CopyStateIcon } from '../../components/share/CopyStateIcon';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
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

const BAR_HEIGHT = 44;
const GAP = 8;
/** Keeps the bar off the viewport edges when the quote runs to the margin. */
const EDGE = 96;

const clamp = (value: number, min: number, max: number) =>
  // A viewport shorter than the bar's own margins has no valid band, and
  // Math.min/Math.max in the wrong order would put the bar off the far edge.
  max < min ? min : Math.min(Math.max(value, min), max);

const position = (selection: TextSelection) => {
  const above = selection.top - BAR_HEIGHT - GAP;
  const center = selection.left + selection.width / 2;
  // Below the quote when it starts at the top of the viewport, where there is
  // no room above it.
  const top = above < GAP ? selection.bottom + GAP : above;
  const { innerHeight, innerWidth } = globalThis;

  return {
    // Clamped to the viewport, not just flipped: in the post modal the quote
    // can sit at the bottom of a short scroll area, where the flipped bar
    // would land below the fold. The page's article is tall enough that this
    // never showed there.
    top: innerHeight ? clamp(top, GAP, innerHeight - BAR_HEIGHT - GAP) : top,
    left: innerWidth ? clamp(center, EDGE, innerWidth - EDGE) : center,
  };
};

export interface SelectionShareBarProps {
  containerRef: RefObject<HTMLElement>;
  /** The post permalink a copied link points at. */
  link: string;
  /** Seeds the card's gradient and names the downloaded file. */
  seed: string;
  source?: { name: string; image?: string };
  /** The surface's own label on the card's logo row. */
  label?: ReactNode;
  /** Called once per action, with how a snapshot ended, so the host logs it. */
  onShare: (provider: ShareProvider, result?: SnapshotResult) => void;
}

export function SelectionShareBar({
  containerRef,
  link,
  seed,
  source,
  label,
  onShare,
}: SelectionShareBarProps): ReactElement | null {
  const barRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(containerRef, true, barRef);
  // The card outlives the bar: pressing Snapshot collapses the selection in
  // some browsers, and the capture still has to find the quote mounted.
  const [quote, setQuote] = useState<TextSelection | null>(null);
  const [linkCopied, copyLink] = useCopyPostLink();
  const [textCopied, copyText] = useCopyText(quote?.text);

  const onCopyLink = useCallback(() => {
    onShare(ShareProvider.CopyLink);
    // `shorten`, not an awaited short URL: the write has to stay inside the
    // task that handled the click or Safari refuses it.
    copyLink({ link, shorten: true, cid: ReferralCampaignKey.SharePost });
  }, [copyLink, link, onShare]);

  const onCopyText = useCallback(() => {
    onShare(ShareProvider.CopyText);
    copyText({ message: '✅ Copied text' });
  }, [copyText, onShare]);

  const onSnapshot = useCallback(
    (result: SnapshotResult) => onShare(ShareProvider.Snapshot, result),
    [onShare],
  );

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
            onResult={onSnapshot}
            captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
            filename={`daily-quote-${seed}`}
            target={cardRef}
            variant={ButtonVariant.Primary}
          />
          <Tooltip content="Copy link">
            <Button
              aria-label="Copy link"
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
          label={label}
          passage={quote.passage}
          seed={seed}
          source={source}
        />
      </div>
    </>,
    document.body,
  );
}

export function SelectionSnapshotBar({
  post,
  containerRef,
}: {
  post: Post;
  containerRef: RefObject<HTMLElement>;
}): ReactElement {
  const { logEvent } = useLogContext();

  const onShare = useCallback(
    (provider: ShareProvider, result?: SnapshotResult) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: {
            provider,
            origin: Origin.TextSelection,
            ...(result && { result }),
          },
        }),
      ),
    [logEvent, post],
  );

  return (
    <SelectionShareBar
      containerRef={containerRef}
      link={post.commentsPermalink}
      onShare={onShare}
      seed={post.id}
      source={snapshotSource(post)}
    />
  );
}
