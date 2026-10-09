import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { BookmarkButton } from '../../buttons/BookmarkButton.v2';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { useFeedPreviewMode } from '../../../hooks/useFeedPreviewMode';
import { visibleOnGroupHover } from './common';

interface CardHeaderBookmarkProps {
  post: Post;
  onBookmarkClick?: (post: Post) => unknown;
  className?: string;
}

/**
 * `card_save_on_hover`: the card's bookmark, in the header right before ⋯.
 * Hidden at rest on desktop and shown while the card is hovered, like Read
 * post and ⋯. Hidden elements are not in the tab order, so for keyboard users
 * it appears once focus is already inside the card (the card's link or a bar
 * button) and is reachable from there; Tab cannot land on it from outside.
 * Always visible on touch screens. Saved or not, it stays hover-only on
 * desktop so the header is empty at rest (product call).
 */
export const CardHeaderBookmark = ({
  post,
  onBookmarkClick,
  className,
}: CardHeaderBookmarkProps): ReactElement | null => {
  const isFeedPreview = useFeedPreviewMode();
  const { onToggleBookmark } = useCardActions({ post, onBookmarkClick });

  if (isFeedPreview) {
    return null;
  }

  return (
    <BookmarkButton
      post={post}
      density="compact"
      id={`post-${post.id}-bookmark-btn`}
      tooltipSide="bottom"
      onClick={onToggleBookmark}
      buttonClassName={classNames(
        'pointer-events-auto',
        visibleOnGroupHover,
        'laptop:mouse:group-focus-within:visible',
        className,
      )}
    />
  );
};
