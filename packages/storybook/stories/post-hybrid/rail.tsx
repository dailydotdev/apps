import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  PostRelationType,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import {
  isSourceUserSource,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { isSourcePublicSquad } from '@dailydotdev/shared/src/graphql/squads';
import type { SourceTooltip } from '@dailydotdev/shared/src/graphql/sources';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PostSignupWidget } from '@dailydotdev/shared/src/components/post/PostSignupWidget';
import SourceEntityCard from '@dailydotdev/shared/src/components/cards/entity/SourceEntityCard';
import SquadEntityCard from '@dailydotdev/shared/src/components/cards/entity/SquadEntityCard';
import UserEntityCard from '@dailydotdev/shared/src/components/cards/entity/UserEntityCard';
import { MentionedToolsWidget } from '@dailydotdev/shared/src/components/brand/MentionedToolsWidget';
import { PreferGoogleSourceAction } from '@dailydotdev/shared/src/components/preferredSources/PreferGoogleSourceAction';
import ShareBar from '@dailydotdev/shared/src/components/ShareBar';
import { ShareMobile } from '@dailydotdev/shared/src/components/ShareMobile';
import { HighlightPostSidebarWidget } from '@dailydotdev/shared/src/components/cards/highlight/HighlightPostSidebarWidget';
import FurtherReading from '@dailydotdev/shared/src/components/widgets/FurtherReading';
import { FeaturedArchives } from '@dailydotdev/shared/src/components/widgets/FeaturedArchives';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import { RelatedPostsWidget } from '@dailydotdev/shared/src/components/post/RelatedPostsWidget';
import { CollectionsIntro } from '@dailydotdev/shared/src/components/post/widgets/CollectionsIntro';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { SidebarAd } from './sidebarAd';

interface HybridRailProps {
  post: Post;
  /** The programmatic unit under the direct-sold card, when ads are live. */
  railAd?: ReactNode;
}

const cardClasses = { container: 'w-full bg-transparent' };

/**
 * Production's right sidebar for the post's type, widget for widget and in
 * the same order: PostWidgets for articles and videos, SquadPostWidgets for
 * squad posts, CollectionPostWidgets for collections. Composed here instead of
 * rendering those components so two things can change for review: the share
 * box keeps its border like every other card in the rail, and the direct-sold
 * card's "Advertise here" sits flush left.
 */
export const HybridRail = ({ post, railAd }: HybridRailProps): ReactElement => {
  const { tokenRefreshed } = useContext(AuthContext);
  const { source } = post;
  const isSquadSource = source?.type === SourceType.Squad;
  const isSquadLayout = [
    PostType.Share,
    PostType.Freeform,
    PostType.Poll,
    PostType.SocialTwitter,
  ].includes(post.type);
  const canShare =
    !isSquadLayout || !isSquadSource || isSourcePublicSquad(source);

  const share = canShare && (
    <>
      {/* ShareBar drops its border for the classic divider column. */}
      <div className="contents [&>div]:!border">
        <ShareBar post={post} />
      </div>
      <ShareMobile
        post={post}
        origin={Origin.ArticlePage}
        link={post.commentsPermalink}
        onCopyPostLink={() => undefined}
      />
    </>
  );
  const directAd = (
    <>
      <SidebarAd
        postId={post.id}
        source={post.source}
        className={cardClasses}
      />
      {railAd}
    </>
  );
  const sourceCard =
    source &&
    !isSourceUserSource(source) &&
    (isSquadSource ? (
      <SquadEntityCard
        className={cardClasses}
        handle={source.handle}
        origin={Origin.ArticlePage}
      />
    ) : (
      <SourceEntityCard
        className={cardClasses}
        source={source as SourceTooltip}
      />
    ));
  const creator = isSquadLayout ? post.author : post.author || post.scout;

  if (post.type === PostType.Collection) {
    return (
      <>
        <PostSignupWidget post={post} />
        <CollectionsIntro className="hidden laptop:flex" />
        <RelatedPostsWidget
          post={post}
          relationType={PostRelationType.Collection}
        />
        {directAd}
        <PreferGoogleSourceAction placement="collection post widgets" />
        {share}
        <HighlightPostSidebarWidget />
        <FeaturedArchives postId={post.id} />
        <FooterLinks />
      </>
    );
  }

  return (
    <>
      <PostSignupWidget post={post} />
      {sourceCard}
      {creator && (
        <UserEntityCard
          className={cardClasses}
          user={creator as UserShortProfile}
          postId={post.id}
        />
      )}
      {directAd}
      {!isSquadLayout && <MentionedToolsWidget postTags={post.tags || []} />}
      <PreferGoogleSourceAction
        placement={isSquadLayout ? 'squad post widgets' : undefined}
      />
      {share}
      <HighlightPostSidebarWidget />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
      <FeaturedArchives postId={post.id} />
      <FooterLinks />
    </>
  );
};
