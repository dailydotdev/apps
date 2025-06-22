import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import type { Squad } from '../../graphql/sources';
import { isSourcePublicSquad } from '../../graphql/squads';
import type { PostWidgetsProps } from './PostWidgets';
import { FooterLinks } from '../footer';
import SquadEntityCard from '../cards/entity/SquadEntityCard';
import UserEntityCard from '../cards/entity/UserEntityCard';
import type { UserShortProfile } from '../../lib/user';
import { PostHeaderActions } from './PostHeaderActions';

export function SquadPostWidgets({
  onCopyPostLink,
  post,
  origin,
  className,
  onClose,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const squad = post.source as Squad;
  const isPublicSquad = isSourcePublicSquad(squad);

  const cardClasses = 'w-full bg-transparent';

  return (
    <PageWidgets className={className}>
      <PostHeaderActions
        post={post}
        onClose={onClose}
        className="hidden pt-6 tablet:flex"
        contextMenuId="post-widgets-context"
      />
      {!!squad && (
        <SquadEntityCard
          className={{
            container: cardClasses,
          }}
          handle={post.source.handle}
          origin={origin}
        />
      )}
      <UserEntityCard
        className={{
          container: cardClasses,
        }}
        user={post.author as UserShortProfile}
      />
      {isPublicSquad && (
        <>
          <ShareBar post={post} />
          <ShareMobile
            post={post}
            origin={origin}
            onCopyPostLink={onCopyPostLink}
            link={post.commentsPermalink}
          />
        </>
      )}
      {tokenRefreshed && <FurtherReading currentPost={post} />}
      <FooterLinks />
    </PageWidgets>
  );
}
