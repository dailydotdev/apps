import React, { ReactElement } from 'react';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import { PostOrigin } from '../../../hooks/analytics/useAnalyticsContextData';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import { PostHeaderActionsProps } from '../common';
import { CollectionsIntro } from '../widgets';
import { RelatedPostsWidget } from '../RelatedPostsWidget';
import { PostRelationType } from '../../../graphql/posts';

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
        post={post}
        onClose={onClose}
        className="hidden pt-6 tablet:flex"
        contextMenuId="post-widgets-context"
      />
      <CollectionsIntro className="hidden tablet:flex" />
      <RelatedPostsWidget
        post={post}
        relationType={PostRelationType.Collection}
      />
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
    </PageWidgets>
  );
};
