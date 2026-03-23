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
  const { source } = post;

  const cardClasses = 'w-full bg-transparent';

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
        showNotificationCtaOnJoin
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
      {sourceCard}
      {creator && (
        <UserEntityCard
          className={{
            container: cardClasses,
          }}
          user={creator as UserShortProfile}
          showNotificationCtaOnFollow
        />
      )}
      <PostSidebarAdWidget
        postId={post.id}
        className={{ container: cardClasses }}
      />
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
