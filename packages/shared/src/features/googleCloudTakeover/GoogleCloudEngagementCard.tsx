import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArticleGrid } from '../../components/cards/article/ArticleGrid';
import { ArticleList } from '../../components/cards/article/ArticleList';
import ArticlePostModal from '../../components/modals/ArticlePostModal';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { GoogleCloudEngagementProvider } from './GoogleCloudEngagementProvider';
import { googleCloudEngagementPost } from './engagementContent';
import { seedGoogleCloudEngagementDiscussion } from './fakeDiscussion';

type GoogleCloudEngagementCardProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;

const openPost = () => {
  if (typeof window !== 'undefined') {
    window.open(
      googleCloudEngagementPost.permalink,
      '_blank',
      'noopener,noreferrer',
    );
  }
};

// The second feed card: a hardcoded popular post that Google Cloud "promotes
// engagement" on. Wrapped in a scoped EngagementAdsProvider so the real brand
// system fires here only — upvoting plays the Google Cloud icon animation, and
// opening the post highlights the sponsored tag. Otherwise it behaves like a
// normal organic card (opens the post modal, has a simulated discussion).
export const GoogleCloudEngagementCard = ({
  isList = false,
  className,
}: GoogleCloudEngagementCardProps): ReactElement => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [post, setPost] = useState<Post>(googleCloudEngagementPost);
  const Card = isList ? ArticleList : ArticleGrid;

  useEffect(() => {
    seedGoogleCloudEngagementDiscussion(
      queryClient,
      googleCloudEngagementPost.id,
    );
  }, [queryClient]);

  const toggleVote = (vote: UserVote) =>
    setPost((current) => {
      const isActive = current.userState?.vote === vote;
      const wasUpvote = current.userState?.vote === UserVote.Up;
      const willUpvote = !isActive && vote === UserVote.Up;
      const upvoteDelta = (willUpvote ? 1 : 0) - (wasUpvote ? 1 : 0);
      return {
        ...current,
        numUpvotes: Math.max(0, (current.numUpvotes ?? 0) + upvoteDelta),
        userState: {
          ...current.userState,
          vote: isActive ? UserVote.None : vote,
        },
      };
    });

  const toggleBookmark = () =>
    setPost((current) => ({ ...current, bookmarked: !current.bookmarked }));

  return (
    <GoogleCloudEngagementProvider>
      <Card
        post={post}
        onPostClick={() => setIsModalOpen(true)}
        onPostAuxClick={openPost}
        onUpvoteClick={() => toggleVote(UserVote.Up)}
        onDownvoteClick={() => toggleVote(UserVote.Down)}
        onCommentClick={() => setIsModalOpen(true)}
        onBookmarkClick={toggleBookmark}
        onShare={noop}
        onCopyLinkClick={noop}
        onReadArticleClick={openPost}
        onMenuClick={noop}
        openNewTab
        domProps={{ className }}
      />
      {isModalOpen && (
        <ArticlePostModal
          isOpen
          id={post.id}
          post={post}
          postPosition={PostPosition.Only}
          onPreviousPost={noop}
          onNextPost={noop}
          onRequestClose={() => setIsModalOpen(false)}
        />
      )}
    </GoogleCloudEngagementProvider>
  );
};
