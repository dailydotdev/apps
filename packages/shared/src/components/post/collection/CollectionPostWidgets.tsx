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
import { PostSidebarAdWidget } from '../PostSidebarAdWidget';
import { FeaturedArchives } from '../../widgets/FeaturedArchives';
import { PostSignupWidget } from '../PostSignupWidget';
import { HighlightPostSidebarWidget } from '../../cards/highlight/HighlightPostSidebarWidget';
import { useAnonymousPostExperience } from '../../../hooks/post/useAnonymousPostExperience';
import { BuildYourFeedWidget } from '../BuildYourFeedWidget';

export const CollectionPostWidgets = ({
  onCopyPostLink,
  post,
  origin,
  className,
}: PostWidgetsProps): ReactElement => {
  const { isAnonPostExperience } = useAnonymousPostExperience();

  return (
    <PageWidgets className={className}>
      {isAnonPostExperience ? <BuildYourFeedWidget /> : <PostSignupWidget />}
      <CollectionsIntro className="hidden laptop:flex" />
      <RelatedPostsWidget
        post={post}
        relationType={PostRelationType.Collection}
      />
      {!isAnonPostExperience && (
        <PostSidebarAdWidget
          postId={post.id}
          className={{ container: 'w-full bg-transparent' }}
        />
      )}
      <ShareBar post={post} />
      <ShareMobile
        post={post}
        origin={origin}
        onCopyPostLink={onCopyPostLink}
        link={post.commentsPermalink}
      />
      <HighlightPostSidebarWidget />
      {!isAnonPostExperience && <FeaturedArchives postId={post.id} />}
      <FooterLinks />
    </PageWidgets>
  );
};
