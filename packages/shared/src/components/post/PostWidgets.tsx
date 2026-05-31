import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { PageWidgets } from '../utilities';
import type { ShareMobileProps } from '../ShareMobile';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import type { PostHeaderActionsProps } from './common';
import { FooterLinks } from '../footer';
import type { UserShortProfile } from '../../lib/user';
import type { SourceTooltip } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import { PostSidebarAdWidget } from './PostSidebarAdWidget';
import { FeaturedArchives } from '../widgets/FeaturedArchives';
import { MentionedToolsWidget } from '../brand/MentionedToolsWidget';
import { HighlightPostSidebarWidget } from '../cards/highlight/HighlightPostSidebarWidget';
import { PostSignupWidget } from './PostSignupWidget';
import { useAnonPostOnboarding } from '../../features/postPageOnboarding/useAnonPostOnboarding';
import { BuildFeedConversionCard } from '../../features/postPageOnboarding/BuildFeedConversionCard';

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../cards/entity/UserEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

const SourceEntityCard = dynamic(
  /* webpackChunkName: "sourceEntityCard" */ () =>
    import('../cards/entity/SourceEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../cards/entity/SquadEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

export type PostWidgetsProps = Omit<PostHeaderActionsProps, 'contextMenuId'> &
  Omit<ShareMobileProps, 'link'>;

export function PostWidgets({
  onCopyPostLink,
  post,
  className,
  origin,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { isEnabled: isAnonExperience } = useAnonPostOnboarding();
  const { source } = post;

  const cardClasses = 'w-full bg-transparent';

  // Anonymous "build your feed" experience: the whole right column becomes a
  // single cohesive conversion card, with the promo demoted to the last slot.
  if (isAnonExperience) {
    // Right rail for anonymous readers: a sticky sign-up + customize card
    // (always in view as they explore the discovery experience below), with
    // the promo beneath it. "Happening Now" is reserved for signed-in users.
    return (
      <PageWidgets className={className}>
        <div className="sticky top-16 flex flex-col gap-4">
          <BuildFeedConversionCard post={post} />
          <PostSidebarAdWidget
            postId={post.id}
            className={{ container: cardClasses }}
          />
        </div>
        <FooterLinks />
      </PageWidgets>
    );
  }

  const creator = post.author || post.scout;
  let sourceCard = null;

  if (source?.type === SourceType.Squad) {
    sourceCard = (
      <SquadEntityCard
        className={{
          container: cardClasses,
        }}
        handle={source.handle}
        origin={origin}
      />
    );
  } else if (source) {
    sourceCard = (
      <SourceEntityCard
        className={{
          container: cardClasses,
        }}
        source={source as SourceTooltip}
      />
    );
  }

  return (
    <PageWidgets className={className}>
      <PostSignupWidget />
      {sourceCard}
      {creator && (
        <UserEntityCard
          className={{
            container: cardClasses,
          }}
          user={creator as UserShortProfile}
        />
      )}
      <PostSidebarAdWidget
        postId={post.id}
        className={{ container: cardClasses }}
      />
      <MentionedToolsWidget postTags={post.tags || []} />
      <ShareBar post={post} />
      <ShareMobile
        post={post}
        origin={origin}
        link={post.commentsPermalink}
        onCopyPostLink={onCopyPostLink}
      />
      <HighlightPostSidebarWidget />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
      <FeaturedArchives postId={post.id} />
      <FooterLinks />
    </PageWidgets>
  );
}
