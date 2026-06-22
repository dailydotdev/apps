import type { ReactElement } from 'react';
import React from 'react';
import { ArticleGrid } from '../../components/cards/article/ArticleGrid';
import { ArticleList } from '../../components/cards/article/ArticleList';
import { googleCloudBlogPost } from './content';

type GoogleCloudBlogCardProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;

// The sponsored Google Cloud blog post, rendered through the real
// ArticleGrid/ArticleList so it is visually identical to an organic feed
// card (source row, title, tags, metadata, cover, engagement bar) with no
// "Sponsored" treatment. Interactions are no-ops for the demo.
export const GoogleCloudBlogCard = ({
  isList = false,
  className,
}: GoogleCloudBlogCardProps): ReactElement => {
  const Card = isList ? ArticleList : ArticleGrid;

  return (
    <Card
      post={googleCloudBlogPost}
      onPostClick={noop}
      onPostAuxClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onCommentClick={noop}
      onBookmarkClick={noop}
      onShare={noop}
      onCopyLinkClick={noop}
      onReadArticleClick={noop}
      onMenuClick={noop}
      domProps={{ className }}
    />
  );
};
