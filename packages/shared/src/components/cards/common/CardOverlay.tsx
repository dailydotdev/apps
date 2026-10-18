import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { CardLink } from './Card';
import { useFeedPreviewMode } from '../../../hooks';
import type { Post } from '../../../graphql/posts';
import { anchorDefaultRel } from '../../../lib/strings';
import { getPostPath } from '../../../lib/links';

interface CardOverlayProps {
  post: Pick<Post, 'commentsPermalink' | 'title' | 'id' | 'slug'>;
  onPostCardClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPostCardAuxClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
}

const CardOverlay = ({
  post,
  onPostCardClick,
  onPostCardAuxClick,
  ariaLabel,
}: CardOverlayProps): ReactElement | null => {
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  return (
    <CardLink
      title={ariaLabel || post.title}
      aria-label={ariaLabel || post.title}
      href={getPostPath(post)}
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
