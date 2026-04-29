import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  UpvoteIcon,
} from '../icons';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { BookmarkButton } from '../buttons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import InteractionCounter from '../InteractionCounter';
import { useVotePost } from '../../hooks/vote/useVotePost';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useLogContext } from '../../contexts/LogContext';
import { ReferralCampaignKey } from '../../lib';
import { ShareProvider } from '../../lib/share';
import { postLogEvent } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import { LogEvent, Origin as LogOrigin } from '../../lib/log';

export interface MobilePostFloatingBarProps {
  post: Post;
  onCommentClick: (origin: Origin) => void;
  className?: string;
}

// Mirrors the floating "Share your thoughts" container that this bar replaces:
// `bg-surface-float` is the gray translucent tint that bar effectively rendered
// once Tailwind layered `bg-blur-baseline` underneath, paired with the same
// backdrop blur and shadow used by the mobile footer chrome. `justify-between`
// + `px-2` spreads the icons edge-to-edge with a small pad so the outermost
// icons don't kiss the rounded corner.
const containerClasses = classNames(
  'flex w-full items-center justify-between rounded-16 border border-border-subtlest-tertiary px-2 py-1',
  'bg-surface-float backdrop-blur-[2.5rem]',
  'shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)]',
);

export function MobilePostFloatingBar({
  post,
  onCommentClick,
  className,
}: MobilePostFloatingBarProps): ReactElement {
  const origin = LogOrigin.ArticlePage;
  const { onClose, onShowPanel } = useBlockPostPanel(post);
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();

  // Match the desktop `PostActions` copy flow: fetch the short URL imperatively
  // on click so anonymous users still get a usable (long) link instead of a no-op.
  const { getShortUrl } = useGetShortUrl();
  const [, copyLink] = useCopyPostLink();
  const { logEvent } = useLogContext();

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onClose(true);
    }

    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }

    await toggleDownvote({ payload: post, origin });
  };

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  const onCopyLink = useCallback(async () => {
    const shortLink = await getShortUrl(
      post.commentsPermalink,
      ReferralCampaignKey.SharePost,
    );
    copyLink({ link: shortLink });
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin },
      }),
    );
  }, [copyLink, getShortUrl, logEvent, origin, post]);

  return (
    <div className={classNames(containerClasses, className)}>
      <QuaternaryButton
        id="mobile-upvote-post-btn"
        aria-label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
        pressed={isUpvoteActive}
        onClick={onToggleUpvote}
        icon={<UpvoteIcon secondary={isUpvoteActive} />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Avocado}
        size={ButtonSize.Medium}
      >
        {upvoteCount > 0 && (
          <InteractionCounter className="tabular-nums" value={upvoteCount} />
        )}
      </QuaternaryButton>
      <QuaternaryButton
        id="mobile-downvote-post-btn"
        aria-label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
        pressed={isDownvoteActive}
        onClick={onToggleDownvote}
        icon={<DownvoteIcon secondary={isDownvoteActive} />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Ketchup}
        size={ButtonSize.Medium}
      />
      <QuaternaryButton
        id="mobile-comment-post-btn"
        aria-label="Comment"
        pressed={post.commented}
        onClick={() => onCommentClick(LogOrigin.PostCommentButton)}
        icon={<CommentIcon secondary={post.commented} />}
        size={ButtonSize.Medium}
        className="btn-tertiary-blueCheese"
      >
        {commentCount > 0 && (
          <InteractionCounter className="tabular-nums" value={commentCount} />
        )}
      </QuaternaryButton>
      <BookmarkButton
        post={post}
        iconSize={IconSize.Medium}
        buttonProps={{
          id: 'mobile-bookmark-post-btn',
          pressed: post.bookmarked,
          onClick: onToggleBookmark,
          size: ButtonSize.Medium,
          className: 'btn-tertiary-bun',
        }}
      />
      <QuaternaryButton
        id="mobile-copy-post-btn"
        aria-label="Copy link"
        onClick={onCopyLink}
        icon={<LinkIcon />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.Medium}
      />
    </div>
  );
}
