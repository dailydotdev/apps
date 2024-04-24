import React, { ReactElement } from 'react';
import { CardButton } from '../Card';
import { useFeedPreviewMode } from '../../../hooks';
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

  if (isFeedPreview) {
    return null;
  }

  return <CardButton title={post.title} onClick={onPostCardClick} />;
};

export default CardOverlay;
