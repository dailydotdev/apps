import React, { ReactElement, useContext } from 'react';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostUsersHighlights } from '../widgets/PostUsersHighlights';
import { PostHeaderActions } from './PostHeaderActions';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { PostHeaderActionsProps } from './common';
import { ShareBookmarkProps } from './PostActions';

export interface PostWidgetsProps
  extends Omit<PostHeaderActionsProps, 'contextMenuId'>,
    ShareBookmarkProps {
  origin?: PostOrigin;
}

export function PostWidgets({
  onShare,
  onReadArticle,
  post,
  className,
  onClose,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);

  return (
    <PageWidgets className={className}>
      <PostHeaderActions
        onReadArticle={onReadArticle}
        post={post}
        onClose={onClose}
        className="hidden pt-6 tablet:flex"
        contextMenuId="post-widgets-context"
      />
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
    </PageWidgets>
  );
}
