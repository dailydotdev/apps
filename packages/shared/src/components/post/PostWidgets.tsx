import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { PageWidgets } from '../utilities';
import type { ShareMobileProps } from '../ShareMobile';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostHeaderActions } from './PostHeaderActions';
import type { PostHeaderActionsProps } from './common';
import { FooterLinks } from '../footer';
import type { UserShortProfile } from '../../lib/user';
import type { SourceTooltip } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';

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
  onReadArticle,
  post,
  className,
  onClose,
  origin,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);

  const cardClasses = 'w-full !bg-background-default';

  const creator = post.author || post.scout;

  return (
    <PageWidgets className={className}>
      <PostHeaderActions
        onReadArticle={onReadArticle}
        post={post}
        onClose={onClose}
        className="hidden pt-6 laptop:flex"
        contextMenuId="post-widgets-context"
      />
      {post.source.type === SourceType.Squad ? (
        <SquadEntityCard
          className={{
            container: cardClasses,
          }}
          handle={post.source.handle}
          origin={origin}
        />
      ) : (
        <SourceEntityCard
          className={{
            container: cardClasses,
          }}
          source={post.source as SourceTooltip}
        />
      )}
      {creator && (
        <UserEntityCard
          className={{
            container: cardClasses,
          }}
          user={creator as UserShortProfile}
        />
      )}
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
