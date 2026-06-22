import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { ArticleGrid } from '../../components/cards/article/ArticleGrid';
import { ArticleList } from '../../components/cards/article/ArticleList';
import ArticlePostModal from '../../components/modals/ArticlePostModal';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import { googleCloudBlogPost } from './content';

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
// so it's identical to an organic card, and behaves like a normal post:
// clicking the card opens the standard article post modal (populated from the
// post object via usePostById's initialData fallback), while "Read post" and
// the modal's read action redirect to the Google Cloud blog.
export const GoogleCloudBlogCard = ({
  isList = false,
  className,
}: GoogleCloudBlogCardProps): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const Card = isList ? ArticleList : ArticleGrid;

  return (
    <>
      <Card
        post={googleCloudBlogPost}
        onPostClick={() => setIsModalOpen(true)}
        onPostAuxClick={openBlog}
        onUpvoteClick={noop}
        onDownvoteClick={noop}
        onCommentClick={() => setIsModalOpen(true)}
        onBookmarkClick={noop}
        onShare={noop}
        onCopyLinkClick={noop}
        onReadArticleClick={openBlog}
        onMenuClick={noop}
        domProps={{ className }}
      />
      {isModalOpen && (
        <ArticlePostModal
          isOpen
          id={googleCloudBlogPost.id}
          post={googleCloudBlogPost}
          postPosition={PostPosition.Only}
          onPreviousPost={noop}
          onNextPost={noop}
          onRequestClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
