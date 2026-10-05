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
  ariaLabel?: string;
}

export const getCardOverlayLinkProps = ({
  post,
  onPostCardClick,
  onPostCardAuxClick,
}: Omit<CardOverlayProps, 'ariaLabel'>) => ({
  href: `${webappUrl}posts/${post.slug ?? post.id}`,
  rel: anchorDefaultRel,
  onClick: (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.ctrlKey || event.metaKey) {
      onPostCardAuxClick?.(event);
    } else {
      event.preventDefault();
      onPostCardClick?.(event);
    }
  },
  onAuxClick: (event: MouseEvent<HTMLAnchorElement>) =>
    onPostCardAuxClick?.(event),
});

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
      {...getCardOverlayLinkProps({
        post,
        onPostCardClick,
        onPostCardAuxClick,
      })}
    />
  );
};

export default CardOverlay;
