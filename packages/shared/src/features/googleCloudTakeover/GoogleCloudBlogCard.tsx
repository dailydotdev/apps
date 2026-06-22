import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArticleGrid } from '../../components/cards/article/ArticleGrid';
import { ArticleList } from '../../components/cards/article/ArticleList';
import ArticlePostModal from '../../components/modals/ArticlePostModal';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { googleCloudBlogPost } from './content';
import { seedGoogleCloudDiscussion } from './fakeDiscussion';

type GoogleCloudBlogCardProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;

const openBlog = () => {
  if (typeof window !== 'undefined') {
    window.open(googleCloudBlogPost.permalink, '_blank', 'noopener,noreferrer');
  }
};

// The sponsored Google Cloud blog post. Renders the real ArticleGrid/ArticleList
// so it's identical to an organic card and behaves like a normal post:
// - clicking opens the standard article post modal (with a simulated 48-comment
//   discussion seeded for the demo), and "Read post" redirects to the blog;
// - upvote / downvote / bookmark toggle locally so engagement is demo-able.
export const GoogleCloudBlogCard = ({
  isList = false,
  className,
}: GoogleCloudBlogCardProps): ReactElement => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [post, setPost] = useState<Post>(googleCloudBlogPost);
  const Card = isList ? ArticleList : ArticleGrid;

  // Seed the simulated discussion so the post modal shows engagement.
  useEffect(() => {
    seedGoogleCloudDiscussion(queryClient, googleCloudBlogPost.id);
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
    <>
      <Card
        post={post}
        onPostClick={() => setIsModalOpen(true)}
        onPostAuxClick={openBlog}
        onUpvoteClick={() => toggleVote(UserVote.Up)}
        onDownvoteClick={() => toggleVote(UserVote.Down)}
        onCommentClick={() => setIsModalOpen(true)}
        onBookmarkClick={toggleBookmark}
        onShare={noop}
        onCopyLinkClick={noop}
        onReadArticleClick={openBlog}
        onMenuClick={noop}
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
    </>
  );
};
