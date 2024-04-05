import Link from 'next/link';
import React, { ReactElement } from 'react';
import { CardButton, CardLink } from '../Card';
import { useFeedLayout, useFeedPreviewMode } from '../../../hooks';
import { Post } from '../../../graphql/posts';

interface CardOverlayProps {
  post: Pick<Post, 'commentsPermalink' | 'title'>;
  onPostCardClick: () => void;
}

const CardOverlay = ({
  post,
  onPostCardClick,
}: CardOverlayProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const { shouldUseMobileFeedLayout } = useFeedLayout();

  if (isFeedPreview) {
    return null;
  }

  if (!shouldUseMobileFeedLayout) {
    return <CardButton title={post.title} onClick={onPostCardClick} />;
  }

  return (
    <Link href={post.commentsPermalink}>
      <CardLink
        title={post.title}
        onClick={onPostCardClick}
        href={post.commentsPermalink}
      />
    </Link>
  );
};

export default CardOverlay;
