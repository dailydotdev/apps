import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import type { Comment } from '../../graphql/comments';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DiscussIcon, LinkIcon, ShareIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { RootPortal } from '../tooltips/Portal';
import { ShareActions } from '../share/ShareActions';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { useCopyText } from '../../hooks/useCopy';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useTextSelectionShare } from '../../hooks/useTextSelectionShare';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { useEventListener } from '../../hooks/useEventListener';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';

export interface SelectionShareBarProps {
  post: Post;
  /** The content the bar is bound to. Only selections inside it raise it. */
  containerRef: RefObject<HTMLElement>;
  /**
   * Set when the bound content is a comment or reply rather than the post
   * body. The share link, the logged event and the quote then belong to the
   * comment, so a reader never quotes a commenter as if they were the author.
   */
  comment?: Comment;
  /**
   * Overrides where a quote is sent. By default the selection is written into
   * the URL as `?comment=`, which the post's comment composer picks up.
   */
  onQuote?: (markdownQuote: string) => void;
  /**
   * Set false on surfaces with no comment composer — briefings, digests and
   * the highlights list. Quote hands off to a composer, so without one the
   * button would be dead. Ignored when `onQuote` is given, since that is a
   * composer by definition.
   */
  canQuote?: boolean;
}

/** Renders the selection as a markdown blockquote for the comment composer. */
export const buildCommentQuote = (selection: string): string =>
  `${selection
    .split('\n')
    .map((line) => `> ${line}`.trimEnd())
    .join('\n')}\n\n`;

// Breathing room between the selection and the bar.
const ANCHOR_GAP = 8;
// Below this distance from the top of the viewport there is no room above the
// selection, so the bar flips underneath it.
const FLIP_THRESHOLD = 64;
const VIEWPORT_MARGIN = 8;
const FALLBACK_BAR_WIDTH = 160;

/**
 * Floating share bar for text selected inside a post body. Ships to everyone —
 * there is no flag gate.
 */
export function SelectionShareBar({
  post,
  containerRef,
  comment,
  onQuote,
  canQuote = true,
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
  const shareLink = comment?.permalink ?? post.commentsPermalink;
  const [isLinkCopied, shareOrCopyLink] = useShareOrCopyLink({
    link: shareLink,
    text: text ?? post.title ?? '',
    cid: ReferralCampaignKey.SharePost,
  });
  const [isTextCopied, copyText] = useCopyText();
  const { getShortUrl } = useGetShortUrl();
  // A comment can only be quoted by whoever wired its reply composer; a post
  // only where its surface renders one.
  const showQuote = onQuote ? true : !comment && canQuote;

  const dismiss = useCallback(() => {
    globalThis?.window?.getSelection?.()?.removeAllRanges();
    clear();
  }, [clear]);

  const logShare = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent(
          comment ? LogEvent.ShareComment : LogEvent.SharePost,
          post,
          {
            extra: {
              provider,
              origin: Origin.TextSelection,
              ...(comment && { commentId: comment.id }),
            },
          },
        ),
      );
    },
    [comment, logEvent, post, postLogEvent],
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

  // Copied prose travels — into a doc, a DM, a slide — and arrives with no idea
  // where it came from. Appending the link keeps the quote attributable, and
  // routing it through `getShortUrl` gives it the same referral credit a plain
  // copy-link would earn. On a comment the reference is that comment, not the
  // post, so the quote points at who actually said it.
  const onCopyText = async () => {
    logShare(ShareProvider.CopyText);

    const reference = await getShortUrl(
      shareLink,
      ReferralCampaignKey.SharePost,
    );

    copyText({
      textToCopy: `${text}\n\n${reference}`,
      message: '✅ Copied text to clipboard',
    });
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

    if (comment) {
      // A comment with no reply handler can still copy and share; silently
      // quoting it into the post composer would misattribute it.
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
              icon={<CopyStateIcon copied={isLinkCopied} idleIcon={LinkIcon} />}
              onClick={onCopyLink}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          <Tooltip content={isTextCopied ? 'Copied!' : 'Copy text'}>
            <Button
              type="button"
              aria-label="Copy selected text"
              icon={<CopyStateIcon copied={isTextCopied} />}
              onClick={onCopyText}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
          {showQuote && (
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
          )}
          <ShareActions
            cid={ReferralCampaignKey.SharePost}
            icon={<ShareIcon />}
            label="Share"
            link={shareLink}
            onOpenChange={setIsShareOpen}
            onShare={logShare}
            text={text}
          />
        </div>
      </div>
    </RootPortal>
  );
}
