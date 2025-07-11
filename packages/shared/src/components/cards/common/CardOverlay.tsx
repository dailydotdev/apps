import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { CardLink } from './Card';
import { useFeedPreviewMode } from '../../../hooks';
import type { Post } from '../../../graphql/posts';
import { webappUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

interface CardOverlayProps {
  post: Pick<Post, 'commentsPermalink' | 'title' | 'id' | 'slug'>;
  onPostCardClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPostCardAuxClick: (event: MouseEvent<HTMLAnchorElement>) => void;
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
        if (event.ctrlKey || event.metaKey) {
          onPostCardAuxClick?.(event);
        } else {
          event.preventDefault();
          onPostCardClick?.(event);
        }
      }}
      onAuxClick={(event) => onPostCardAuxClick?.(event)}
    />
  );
};

export default CardOverlay;
