import React, { ReactElement, useContext } from 'react';

import AuthContext from '../../contexts/AuthContext';
import { FooterLinks } from '../footer';
import ShareBar from '../ShareBar';
import { ShareMobile, ShareMobileProps } from '../ShareMobile';
import { PageWidgets } from '../utilities';
import FurtherReading from '../widgets/FurtherReading';
import { PostUsersHighlights } from '../widgets/PostUsersHighlights';
import { PostHeaderActionsProps } from './common';
import { PostHeaderActions } from './PostHeaderActions';

export type PostWidgetsProps = Omit<PostHeaderActionsProps, 'contextMenuId'> &
  Omit<ShareMobileProps, 'link'>;

export function PostWidgets({
  onCopyPostLink,
  onReadArticle,
  post,
  className,
  onClose,
  origin,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);

  return (
    <PageWidgets className={className}>
      <PostHeaderActions
        onReadArticle={onReadArticle}
        post={post}
        onClose={onClose}
        className="hidden pt-6 laptop:flex"
        contextMenuId="post-widgets-context"
      />
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile
        post={post}
        origin={origin}
        link={post.commentsPermalink}
        onCopyPostLink={onCopyPostLink}
      />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
      <FooterLinks />
    </PageWidgets>
  );
}
