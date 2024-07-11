import React, { ReactElement, useContext } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
} from '../icons';
import { Post, UserVote } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { PostOrigin } from '../../hooks/log/useLogContextData';
import { useVotePost } from '../../hooks';
import { Origin } from '../../lib/log';
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
import { ButtonColor, ButtonVariant } from '../buttons/Button';
import { BookmarkButton } from '../buttons';

interface PostActionsProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
  onComment?: () => unknown;
  origin?: PostOrigin;
  onCopyLinkClick?: (post?: Post) => void;
}

export function PostActions({
  onCopyLinkClick,
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

          return mutateVoteFeedPost({
            id,
            vote,
            items,
            updatePost,
          });
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
      <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
        <Card
          className={classNames(
            'flex !flex-row gap-2 hover:border-border-subtlest-tertiary',
            {
              'border-accent-avocado-default hover:!border-accent-avocado-default bg-theme-overlay-float-avocado':
                post?.userState?.vote === UserVote.Up,
              'border-accent-ketchup-default hover:!border-accent-ketchup-default bg-theme-overlay-float-ketchup':
                post?.userState?.vote === UserVote.Down,
            },
          )}
        >
          <QuaternaryButton
            id="upvote-post-btn"
            pressed={post?.userState?.vote === UserVote.Up}
            onClick={onToggleUpvote}
            icon={
              <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
            }
            aria-label="Upvote"
            responsiveLabelClass={actionsClassName}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
          />
          <QuaternaryButton
            id="downvote-post-btn"
            pressed={post?.userState?.vote === UserVote.Down}
            onClick={onToggleDownvote}
            icon={
              <DownvoteIcon
                secondary={post?.userState?.vote === UserVote.Down}
              />
            }
            aria-label="Downvote"
            responsiveLabelClass={actionsClassName}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
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
          <BookmarkButton
            post={post}
            contextMenuId="post-content-bookmark"
            buttonProps={{
              id: 'bookmark-post-btn',
              pressed: post.bookmarked,
              onClick: onToggleBookmark,
              responsiveLabelClass: actionsClassName,
              className: 'btn-tertiary-bun',
            }}
          >
            Bookmark
          </BookmarkButton>
          <QuaternaryButton
            id="copy-post-btn"
            onClick={() => onCopyLinkClick(post)}
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
