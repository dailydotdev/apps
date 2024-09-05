import React, { ReactElement } from 'react';
import { CardButton } from '../Card';
import { useFeedPreviewMode } from '../../../hooks';
import { Post } from '../../../graphql/posts';
import { webappUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

interface CardOverlayProps {
  post: Pick<Post, 'commentsPermalink' | 'title' | 'id' | 'slug'>;
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

  return (
    <CardButton
      title={post.title}
      onClick={onPostCardClick}
      href={`${webappUrl}posts/${post.slug ?? post.id}`}
      rel={anchorDefaultRel}
    />
  );
};

export default CardOverlay;
