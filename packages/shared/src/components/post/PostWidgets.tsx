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

const UserEntityCard = dynamic(
  /* webpackChunkName: "UserEntityCard" */ () =>
    import('../cards/entity/UserEntityCard'),
);

const SourceEntityCard = dynamic(
  /* webpackChunkName: "SourceEntityCard" */ () =>
    import('../cards/entity/SourceEntityCard'),
);

const SquadEntityCard = dynamic(
  /* webpackChunkName: "SquadEntityCard" */ () =>
    import('../cards/entity/SquadEntityCard'),
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

  const cardClasses = 'w-full bg-inherit';

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
      {post.author && (
        <UserEntityCard
          className={{
            container: cardClasses,
          }}
          user={post.author as UserShortProfile}
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
