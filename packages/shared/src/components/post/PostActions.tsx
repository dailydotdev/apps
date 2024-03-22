import React, { ReactElement, useContext } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  BookmarkIcon,
  DownvoteIcon,
  LinkIcon,
} from '../icons';
import { Post, UserPostVote } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { useVotePost } from '../../hooks';
import { Origin } from '../../lib/analytics';
import { Card } from '../cards/Card';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostTagsPanel } from './block/PostTagsPanel';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { ActiveFeedContext } from '../../contexts';
import { mutateVoteFeedPost } from '../../hooks/vote/utils';
import { updateCachedPagePost } from '../../lib/query';
import {
  mutateBookmarkFeedPost,
  useBookmarkPost,
} from '../../hooks/useBookmarkPost';

export interface ShareBookmarkProps {
  onShare?: (post?: Post) => void;
}

interface PostActionsProps extends ShareBookmarkProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
  onComment?: () => unknown;
  origin?: PostOrigin;
}

export function PostActions({
  onShare,
  post,
  actionsClassName = 'hidden mobileL:flex',
  onComment,
  origin = Origin.ArticlePage,
}: PostActionsProps): ReactElement {
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();

  const { toggleUpvote, toggleDownvote } = useVotePost({
    variables: { feedName: feedQueryKey },
    onMutate: feedQueryKey
      ? ({ id, vote }) => {
          const updatePost = updateCachedPagePost(feedQueryKey, queryClient);

          return mutateVoteFeedPost({ id, vote, items, updatePost });
        }
      : undefined,
  });

  const { toggleBookmark } = useBookmarkPost({
    mutationKey: feedQueryKey,
    onMutate: feedQueryKey
      ? ({ id }) => {
          const updatePost = updateCachedPagePost(feedQueryKey, queryClient);

          return mutateBookmarkFeedPost({ id, items, updatePost });
        }
      : undefined,
  });

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserPostVote.None) {
      onClose(true);
    }

    await toggleUpvote({ post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserPostVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }

    await toggleDownvote({ post, origin });
  };

  return (
    <ConditionalWrapper
      condition={showTagsPanel !== undefined}
      wrapper={(children) => (
        <div className="flex flex-col">
          {children}
          <PostTagsPanel post={post} className="mt-4" toastOnSuccess={false} />
        </div>
      )}
    >
      <div className="flex items-center rounded-16 border border-theme-divider-tertiary">
        <Card
          className={classNames(
            'flex !flex-row gap-2 hover:border-theme-divider-tertiary',
            {
              'border-theme-color-avocado hover:!border-theme-color-avocado bg-theme-overlay-float-avocado':
                post?.userState?.vote === UserPostVote.Up,
              'border-theme-color-ketchup hover:!border-theme-color-ketchup bg-theme-overlay-float-ketchup':
                post?.userState?.vote === UserPostVote.Down,
            },
          )}
        >
          <QuaternaryButton
            id="upvote-post-btn"
            pressed={post?.userState?.vote === UserPostVote.Up}
            onClick={onToggleUpvote}
            icon={
              <UpvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Up}
              />
            }
            aria-label="Upvote"
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-avocado"
          />
          <QuaternaryButton
            id="downvote-post-btn"
            pressed={post?.userState?.vote === UserPostVote.Down}
            onClick={onToggleDownvote}
            icon={
              <DownvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Down}
              />
            }
            aria-label="Downvote"
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-ketchup"
          />
        </Card>
        <div className="flex flex-1 items-center justify-between px-4 py-2">
          <QuaternaryButton
            id="comment-post-btn"
            pressed={post.commented}
            onClick={onComment}
            icon={<CommentIcon secondary={post.commented} />}
            aria-label="Comment"
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-blueCheese"
          >
            Comment
          </QuaternaryButton>
          <QuaternaryButton
            id="bookmark-post-btn"
            pressed={post.bookmarked}
            onClick={onToggleBookmark}
            icon={<BookmarkIcon secondary={post.bookmarked} />}
            aria-label="Bookmark"
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-bun"
          >
            Bookmark
          </QuaternaryButton>
          <QuaternaryButton
            id="share-post-btn"
            onClick={() => onShare(post)}
            icon={<LinkIcon />}
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-cabbage"
          >
            Copy
          </QuaternaryButton>
        </div>
      </div>
    </ConditionalWrapper>
  );
}
