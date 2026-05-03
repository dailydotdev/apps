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
import { CardAction } from '../buttons/CardAction';
import { CardActionBar } from '../buttons/CardActionBar';
import { BookmarkButton } from '../buttons';
import { ButtonColor } from '../buttons/ButtonV2';
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
// backdrop blur and shadow used by the mobile footer chrome. CardActionBar
// `between` distributes the actions edge-to-edge with `px-2` on the wrapper
// so the outermost icons don't kiss the rounded corner.
const containerClasses = classNames(
  'w-full rounded-16 border border-border-subtlest-tertiary px-2 py-1',
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
    <CardActionBar
      layout="between"
      className={classNames(containerClasses, className)}
    >
      <CardAction
        id="mobile-upvote-post-btn"
        label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
        pressed={isUpvoteActive}
        onClick={onToggleUpvote}
        icon={<UpvoteIcon />}
        iconPressed={<UpvoteIcon secondary />}
        count={upvoteCount}
        color={ButtonColor.Avocado}
      />
      <CardAction
        id="mobile-downvote-post-btn"
        label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
        pressed={isDownvoteActive}
        onClick={onToggleDownvote}
        icon={<DownvoteIcon />}
        iconPressed={<DownvoteIcon secondary />}
        color={ButtonColor.Ketchup}
      />
      <CardAction
        id="mobile-comment-post-btn"
        label="Comment"
        pressed={post.commented}
        onClick={() => onCommentClick(LogOrigin.PostCommentButton)}
        icon={<CommentIcon />}
        iconPressed={<CommentIcon secondary />}
        count={commentCount}
        color={ButtonColor.BlueCheese}
      />
      <BookmarkButton
        post={post}
        id="mobile-bookmark-post-btn"
        pressed={post.bookmarked}
        onClick={onToggleBookmark}
      />
      <CardAction
        id="mobile-copy-post-btn"
        label="Copy link"
        onClick={onCopyLink}
        icon={<LinkIcon />}
        color={ButtonColor.Cabbage}
      />
    </CardActionBar>
  );
}
