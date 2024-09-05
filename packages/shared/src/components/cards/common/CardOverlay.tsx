import React, { ReactElement } from 'react';

import { Post } from '../../../graphql/posts';
import { useFeedPreviewMode } from '../../../hooks';
import { CardButton } from '../Card';

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
