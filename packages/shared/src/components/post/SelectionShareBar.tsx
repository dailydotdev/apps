import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import type { Comment } from '../../graphql/comments';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DiscussIcon, LinkIcon, ShareIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { RootPortal } from '../tooltips/Portal';
import { ShareActions } from '../share/ShareActions';
import type { SelectionSharePost } from './SelectionShareProvider';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { useCopyText } from '../../hooks/useCopy';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useSelectionAnchor } from '../../hooks/useSelectionAnchor';
import type { TextSelectionRect } from '../../hooks/useTextSelectionShare';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { useEventListener } from '../../hooks/useEventListener';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { shouldUseNativeShare } from '../../lib/func';
import { ReferralCampaignKey } from '../../lib/referral';
import { buildCommentQuote, truncateForUrl } from '../../lib/strings';

export interface SelectionShareBarProps {
  post: SelectionSharePost;
  /** The live selection, supplied by `SelectionShareProvider`. */
  text: string;
  rect: TextSelectionRect;
  clear: () => void;
  /**
   * Set when the selection sits in a comment or reply rather than post content.
   * The share link, the logged event and the quote then belong to the comment,
   * so a reader never quotes a commenter as if they were the author.
   */
  comment?: Comment;
  /**
   * False on surfaces with no comment composer — briefings, digests and the
   * highlights list. Quote hands off to a composer, so without one the button
   * would be dead. Ignored when `onQuote` is given, since that is a composer by
   * definition.
   */
  canQuote?: boolean;
  /**
   * Overrides where a quote is sent. By default the selection is written into
   * the URL as `?comment=`, which the post's comment composer picks up.
   */
  onQuote?: (markdownQuote: string) => void;
}

/**
 * Floating share bar for text selected inside a post or comment. Ships to
 * everyone — there is no flag gate.
 *
 * Rendered once per page by `SelectionShareProvider`, which owns the selection
 * watcher and decides which region the selection belongs to.
 */
export function SelectionShareBar({
  post,
  text,
  rect,
  clear,
  comment,
  canQuote = true,
  onQuote,
}: SelectionShareBarProps): ReactElement {
  const barRef = useRef<HTMLDivElement>(null);
  // The share popover portals out of the bar, so an open popover has to hold
  // the bar open — otherwise clicking a network inside it reads as a click away.
  const [isShareOpen, setIsShareOpen] = useState(false);
  const router = useRouter();

  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const shareLink = comment?.permalink ?? post.commentsPermalink;
  // Referral credit follows what is being shared, matching `useShareComment`.
  const campaign = comment
    ? ReferralCampaignKey.ShareComment
    : ReferralCampaignKey.SharePost;
  const [isLinkCopied, shareOrCopyLink] = useShareOrCopyLink({
    link: shareLink,
    text,
    cid: campaign,
  });
  const [isTextCopied, copyText] = useCopyText();
  const { left, top, flipsBelow, isMeasured } = useSelectionAnchor(
    rect,
    barRef,
  );

  // Resolved while the bar is open, so the copy handler can stay synchronous.
  // WebKit only honours a clipboard write inside the task that handled the
  // gesture; awaiting a round-trip on click loses the write entirely.
  const { shareLink: reference } = useGetShortUrl({
    query: { url: shareLink, cid: campaign },
  });

  const dismiss = useCallback(() => {
    globalThis?.window?.getSelection?.()?.removeAllRanges();
    clear();
  }, [clear]);

  const logShare = useCallback(
    (provider: ShareProvider) => {
      logEvent(
        postLogEvent(
          comment ? LogEvent.ShareComment : LogEvent.SharePost,
          // `postLogEvent` optional-chains every field it reads, but its
          // signature demands a whole Post.
          post as Post,
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

  useOutsideClick(
    barRef,
    () => clear(),
    // The provider drops the selection on its own when the reader clicks back
    // into the text, so this only has to catch clicks elsewhere on the page.
    !isShareOpen,
  );

  useEventListener(globalThis?.document, 'keydown', (event: KeyboardEvent) => {
    // The popover closes itself on Escape; only the second press drops the bar.
    if (event.key === 'Escape' && !isShareOpen) {
      dismiss();
    }
  });

  const onCopyLink = () => {
    // `shareOrCopyLink` hands off to the native sheet where one exists, so the
    // provider has to be resolved the same way `ShareActions` resolves it —
    // otherwise every mobile share is logged as a copy.
    logShare(
      shouldUseNativeShare() ? ShareProvider.Native : ShareProvider.CopyLink,
    );
    shareOrCopyLink();
  };

  const onCopyText = () => {
    logShare(ShareProvider.CopyText);
    copyText({
      textToCopy: `${text}\n\n${reference ?? shareLink}`,
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

    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          // A whole-article selection would otherwise become a multi-kilobyte
          // URL and history entry.
          comment: truncateForUrl(quote),
          commentOrigin: Origin.TextSelection,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  // A comment can only be quoted by whoever wired its reply composer; a post
  // only where its surface renders one.
  const showQuote = onQuote ? true : !comment && canQuote;

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
          // Width is only known after the first layout pass, and a bar that
          // needs clamping would visibly jump on that frame.
          visibility: isMeasured ? undefined : 'hidden',
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
            cid={campaign}
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
