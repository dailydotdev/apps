import type { ReactElement } from 'react';
import React from 'react';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import { CollectionsIntro } from '../widgets';
import { RelatedPostsWidget } from '../RelatedPostsWidget';
import { PostRelationType } from '../../../graphql/posts';
import type { PostWidgetsProps } from '../PostWidgets';
import { FooterLinks } from '../../footer';

export const CollectionPostWidgets = ({
  onCopyPostLink,
  post,
  origin,
  className,
}: PostWidgetsProps): ReactElement => {
  return (
    <PageWidgets className={className}>
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
