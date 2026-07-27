import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, DiscussIcon, LinkIcon, ShareIcon, VIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { RootPortal } from '../tooltips/Portal';
import { ShareActions } from '../share/ShareActions';
import { useCopyText } from '../../hooks/useCopy';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { useTextSelectionShare } from '../../hooks/useTextSelectionShare';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { useEventListener } from '../../hooks/useEventListener';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import { webappUrl } from '../../lib/constants';

export interface SelectionShareBarProps {
  post: Post;
  /** The post body. Only selections made inside it raise the bar. */
  containerRef: RefObject<HTMLElement>;
  /**
   * Overrides where a quote is sent. By default the selection is written into
   * the URL as `?comment=`, which the post's comment composer picks up.
   */
  onQuote?: (markdownQuote: string) => void;
}

/** Renders the selection as a markdown blockquote for the comment composer. */
export const buildCommentQuote = (selection: string): string =>
  `${selection
    .split('\n')
    .map((line) => `> ${line}`.trimEnd())
    .join('\n')}\n\n`;

// Quote images read badly past a couple of sentences, and the text rides in the
// generator URL, so cap it well below any browser URL limit.
const MAX_QUOTE_LENGTH = 280;
// Breathing room between the selection and the bar.
const ANCHOR_GAP = 8;
// Below this distance from the top of the viewport there is no room above the
// selection, so the bar flips underneath it.
const FLIP_THRESHOLD = 64;
const VIEWPORT_MARGIN = 8;
const FALLBACK_BAR_WIDTH = 160;

// The quote-image route renders headlessly for the screenshot service, so
// there is no user-facing entry point yet: sending someone to the raw
// generator page lands them on a bare 1200x630 bitmap template. Exported for
// the image-generator route and for the follow-up that turns this into a
// previewable, downloadable share once the service serves the PNG.
export const buildQuoteImageUrl = (postId: string, text: string): string => {
  const quote =
    text.length > MAX_QUOTE_LENGTH
      ? `${text.slice(0, MAX_QUOTE_LENGTH).trimEnd()}…`
      : text;

  return `${webappUrl}image-generator/quote/${postId}?text=${encodeURIComponent(
    quote,
  )}`;
};

// Copy actions confirm twice: the toast says what happened, and the button
// itself swaps to a check. `useCopyLink`/`useCopyText` hold `copying` for a
// second, which is the whole life of this transition. Both icons are stacked in
// one grid cell so the button never changes width mid-swap.
const CopyFeedbackIcon = ({
  copied,
  icon,
}: {
  copied: boolean;
  icon: ReactElement;
}): ReactElement => (
  <span className="grid place-items-center">
    <span
      className={classNames(
        'col-start-1 row-start-1 transition-all duration-200 motion-reduce:transition-none',
        copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
      )}
    >
      {icon}
    </span>
    <span
      aria-hidden
      className={classNames(
        'col-start-1 row-start-1 text-status-success transition-all duration-200 motion-reduce:transition-none',
        copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    >
      <VIcon />
    </span>
  </span>
);

/**
 * Floating share bar for text selected inside a post body. Ships to everyone —
 * there is no flag gate.
 */
export function SelectionShareBar({
  post,
  containerRef,
  onQuote,
}: SelectionShareBarProps): ReactElement | null {
  const { text, rect, clear } = useTextSelectionShare({ containerRef });
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(FALLBACK_BAR_WIDTH);
  const { width: viewportWidth } = useVisualViewport();
  const [viewportOffset, setViewportOffset] = useState({ left: 0, top: 0 });
  // The share popover portals out of the bar, so an open popover has to hold
  // the bar open — otherwise clicking a network inside it reads as a click away.
  const [isShareOpen, setIsShareOpen] = useState(false);
  const router = useRouter();

  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [isLinkCopied, shareOrCopyLink] = useShareOrCopyLink({
    link: post.commentsPermalink,
    text: text ?? post.title ?? '',
    cid: ReferralCampaignKey.SharePost,
  });
  const [isTextCopied, copyText] = useCopyText();

  const dismiss = useCallback(() => {
    globalThis?.window?.getSelection?.()?.removeAllRanges();
    clear();
  }, [clear]);

  const logShare = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.TextSelection },
        }),
      );
    },
    [logEvent, post, postLogEvent],
  );

  useLayoutEffect(() => {
    if (barRef.current) {
      setBarWidth(barRef.current.offsetWidth);
    }
  }, [text]);

  useOutsideClick(
    barRef,
    (event) => {
      // Clicks back inside the body collapse the selection on their own; acting
      // here too would race the browser and drop the bar mid-drag.
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      clear();
    },
    !!text && !isShareOpen,
  );

  useEventListener(
    text ? globalThis?.document : null,
    'keydown',
    (event: KeyboardEvent) => {
      // The popover closes itself on Escape; only the second press drops the bar.
      if (event.key === 'Escape' && !isShareOpen) {
        dismiss();
      }
    },
  );

  // Pinch-zoom pans the visual viewport without moving the layout viewport that
  // a `fixed` element is positioned in, so track the offset and clamp to it.
  useEventListener(
    text ? globalThis?.window?.visualViewport : null,
    'scroll',
    () => {
      const viewport = globalThis?.window?.visualViewport;
      setViewportOffset({
        left: viewport?.offsetLeft ?? 0,
        top: viewport?.offsetTop ?? 0,
      });
    },
  );

  if (!text || !rect) {
    return null;
  }

  const availableWidth = viewportWidth || globalThis?.window?.innerWidth || 0;
  const half = barWidth / 2;
  const minCenter = viewportOffset.left + VIEWPORT_MARGIN + half;
  const maxCenter =
    viewportOffset.left + availableWidth - VIEWPORT_MARGIN - half;
  const center = rect.left + (rect.right - rect.left) / 2;
  const left = Math.min(
    Math.max(center, minCenter),
    Math.max(minCenter, maxCenter),
  );
  const flipsBelow = rect.top - viewportOffset.top < FLIP_THRESHOLD;
  const top = flipsBelow ? rect.bottom + ANCHOR_GAP : rect.top - ANCHOR_GAP;

  const onCopyLink = () => {
    logShare(ShareProvider.CopyLink);
    shareOrCopyLink();
  };

  const onCopyText = () => {
    logShare(ShareProvider.CopyText);
    copyText({ textToCopy: text, message: '✅ Copied text to clipboard' });
  };

  // The composer is the one action that consumes the selection rather than
  // copying it, so hand off the markdown and get out of the way. `NewComment`
  // is already mounted on every surface the bar appears on and already watches
  // `?comment=`, so the URL is the hand-off — no ref plumbing across the page.
  // It logs `OpenComment` when it opens, so the bar deliberately does not.
  const onQuoteInComment = () => {
    const quote = buildCommentQuote(text);

    dismiss();

    if (onQuote) {
      onQuote(quote);
      return;
    }

    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          comment: quote,
          commentOrigin: Origin.TextSelection,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <RootPortal>
      {/*
        Anchoring and the reveal have to live on separate elements:
        `animate-composer-in` animates `transform` with `animation-fill-mode:
        both`, so sharing an element would leave the animation's final
        `translateY(0)` overriding the anchoring translate for good.
      */}
      <div
        className="fixed z-modal"
        style={{
          left,
          top,
          transform: `translate(-50%, ${flipsBelow ? '0' : '-100%'})`,
        }}
      >
        <div
          ref={barRef}
          role="toolbar"
          aria-label="Share selected text"
          data-testid="selectionShareBar"
          className="flex animate-composer-in items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2 motion-reduce:animate-none"
        >
          {/*
            Tooltips stay to one or two words — the bar sits right on top of
            what the reader just selected, so a sentence in a tooltip covers the
            thing they are trying to look at. The aria-labels keep the long
            form, where the extra context costs nothing.
          */}
          <Tooltip content={isLinkCopied ? 'Copied!' : 'Copy link'}>
            <Button
              type="button"
              aria-label="Copy link to this post"
              icon={
                <CopyFeedbackIcon copied={isLinkCopied} icon={<LinkIcon />} />
              }
              onClick={onCopyLink}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <Tooltip content={isTextCopied ? 'Copied!' : 'Copy text'}>
            <Button
              type="button"
              aria-label="Copy selected text"
              icon={
                <CopyFeedbackIcon copied={isTextCopied} icon={<CopyIcon />} />
              }
              onClick={onCopyText}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <Tooltip content="Quote">
            <Button
              type="button"
              aria-label="Quote in a comment"
              icon={<DiscussIcon />}
              onClick={onQuoteInComment}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <ShareActions
            cid={ReferralCampaignKey.SharePost}
            icon={<ShareIcon />}
            label="Share"
            link={post.commentsPermalink}
            onOpenChange={setIsShareOpen}
            onShare={logShare}
            text={text}
          />
        </div>
      </div>
    </RootPortal>
  );
}
