import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import type { SourceTooltip, Squad } from '../../graphql/sources';
import { isSourceUserSource, SourceType } from '../../graphql/sources';
import { isSourcePublicSquad } from '../../graphql/squads';
import type { PostWidgetsProps } from './PostWidgets';
import { FooterLinks } from '../footer';
import SquadEntityCard from '../cards/entity/SquadEntityCard';
import SourceEntityCard from '../cards/entity/SourceEntityCard';
import UserEntityCard from '../cards/entity/UserEntityCard';
import type { UserShortProfile } from '../../lib/user';
import { PostSidebarAdWidget } from './PostSidebarAdWidget';

export function SquadPostWidgets({
  onCopyPostLink,
  post,
  origin,
  className,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const isUserSource = isSourceUserSource(post.source);
  const isSquadSource = post.source.type === SourceType.Squad;
  const canShare = !isSquadSource || isSourcePublicSquad(post.source as Squad);

  const cardClasses = 'w-full bg-transparent';

  return (
    <PageWidgets className={className}>
      {!isUserSource &&
        (isSquadSource ? (
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
        ))}
      {!!post.author && (
        <UserEntityCard
          className={{
            container: cardClasses,
          }}
          user={post.author as UserShortProfile}
        />
      )}
      <PostSidebarAdWidget
        postId={post.id}
        className={{ container: cardClasses }}
      />
      {canShare && (
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
