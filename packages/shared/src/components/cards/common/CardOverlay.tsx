import React, { ReactElement } from 'react';
import { CardLink } from '../Card';
import { useFeedPreviewMode } from '../../../hooks';
import { Post } from '../../../graphql/posts';
import { webappUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

interface CardOverlayProps {
  post: Pick<Post, 'commentsPermalink' | 'title' | 'id' | 'slug'>;
  onPostCardClick: () => void;
  onPostCardAuxClick?: () => void;
}

const CardOverlay = ({
  post,
  onPostCardClick,
  onPostCardAuxClick,
}: CardOverlayProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  return (
    <CardLink
      title={post.title}
      href={`${webappUrl}posts/${post.slug ?? post.id}`}
      rel={anchorDefaultRel}
      onClick={(event) => {
        event.preventDefault();
        onPostCardClick?.();
      }}
      onAuxClick={() => onPostCardAuxClick?.()}
    />
  );
};

export default CardOverlay;
