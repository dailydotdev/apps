import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CopyIcon, LinkIcon } from '../../components/icons';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import type { Post } from '../../graphql/posts';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { SNAPSHOT_SIZE } from './snapshotGradient';
import type { TextSelection } from './useTextSelection';
import { useTextSelection } from './useTextSelection';

const BAR_HEIGHT = 44;
const GAP = 8;
/** Keeps the bar off the viewport edges when the quote runs to the margin. */
const EDGE = 96;

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

const position = (selection: TextSelection) => {
  const above = selection.top - BAR_HEIGHT - GAP;
  const center = selection.left + selection.width / 2;

  return {
    // Below the quote when it starts at the top of the viewport, where there
    // is no room above it.
    top: above < GAP ? selection.bottom + GAP : above,
    left: Math.min(
      Math.max(center, EDGE),
      globalThis.innerWidth ? globalThis.innerWidth - EDGE : center,
    ),
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
  const [, copyLink] = useCopyPostLink();
  const [, copyText] = useCopyText(quote?.text);
  const { getShortUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();

  // The same link every other copy on the page produces: shortened, and
  // carrying the share campaign so the visit is attributed.
  const getTrackedLink = useCallback(
    () => getShortUrl(post.commentsPermalink, ReferralCampaignKey.SharePost),
    [getShortUrl, post.commentsPermalink],
  );

  const onCopyLink = useCallback(async () => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin: Origin.PostContent },
      }),
    );
    copyLink({ link: await getTrackedLink() });
  }, [copyLink, getTrackedLink, logEvent, post]);

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
          className="fixed z-max inline-flex -translate-x-1/2 items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
          role="toolbar"
          style={position(selection)}
        >
          {/* Snapshot leads, labelled and solid: it is the reason the bar
              exists, and the two copies beside it are the familiar fallbacks. */}
          <SnapshotButton
            captureOptions={CAPTURE_OPTIONS}
            filename={`daily-quote-${post.id}`}
            link={getTrackedLink}
            target={cardRef}
            variant={ButtonVariant.Primary}
          />
          <Tooltip content="Copy link">
            <Button
              aria-label="Copy link"
              icon={<LinkIcon />}
              onClick={onCopyLink}
              size={ButtonSize.Small}
              type="button"
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <Tooltip content="Copy text">
            <Button
              aria-label="Copy text"
              icon={<CopyIcon />}
              onClick={() => copyText({ message: '✅ Copied text' })}
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
          domain={post.domain}
          postTitle={post.title}
          seed={post.id}
          source={
            post.source
              ? { name: post.source.name, image: post.source.image }
              : undefined
          }
          text={quote.text}
        />
      </div>
    </>,
    document.body,
  );
}
