import React, { ReactElement } from 'react';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import { CollectionsIntro } from '../widgets';
import { RelatedPostsWidget } from '../RelatedPostsWidget';
import { PostRelationType } from '../../../graphql/posts';
import { PostWidgetsProps } from '../PostWidgets';
import { FooterLinks } from '../../footer';

export const CollectionPostWidgets = ({
  onCopyPostLink,
  post,
  origin,
  className,
  onClose,
}: PostWidgetsProps): ReactElement => {
  return (
    <PageWidgets className={className}>
      <CollectionPostHeaderActions
        post={post}
        onClose={onClose}
        className="hidden pt-6 laptop:flex"
        contextMenuId="post-widgets-context"
      />
      <CollectionsIntro className="hidden laptop:flex" />
      <RelatedPostsWidget
        post={post}
        relationType={PostRelationType.Collection}
      />
      <ShareBar post={post} />
      <ShareMobile
        post={post}
        origin={origin}
        onCopyPostLink={onCopyPostLink}
        link={post.commentsPermalink}
      />
      <FooterLinks />
    </PageWidgets>
  );
};
