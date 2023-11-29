import React, { ReactElement } from 'react';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import { PostOrigin } from '../../../hooks/analytics/useAnalyticsContextData';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import { PostHeaderActionsProps } from '../common';
import { CollectionsIntro } from '../widgets';
import { RelatedPostsWidget } from '../RelatedPostsWidget';

interface PostWidgetsProps
  extends Omit<PostHeaderActionsProps, 'contextMenuId'> {
  origin?: PostOrigin;
}

export const CollectionPostWidgets = ({
  onShare,
  post,
  className,
  onClose,
}: PostWidgetsProps): ReactElement => {
  return (
    <PageWidgets className={className}>
      <CollectionPostHeaderActions
        onShare={onShare}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      <CollectionsIntro className="hidden tablet:flex" />
      <RelatedPostsWidget post={post} />
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
    </PageWidgets>
  );
};
