import React, { ReactElement, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext, { useAuthContext } from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostHeaderActions } from './PostHeaderActions';
import SourceButton from '../cards/SourceButton';
import { SourceMember, Squad } from '../../graphql/sources';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/log';
import { useSquad } from '../../hooks';
import { getSquadMembers, isSourcePublicSquad } from '../../graphql/squads';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { PostWidgetsProps } from './PostWidgets';
import { ProfileImageSize } from '../ProfilePicture';
import { FooterLinks } from '../footer';

const SquadCard = ({ squadSource }: { squadSource: Squad }) => {
  const { isFetched } = useAuthContext();
  const { id: squadId, handle } = squadSource;
  const { squad } = useSquad({ handle });

  const { data: squadMembers } = useQuery<SourceMember[]>(
    ['squadMembersInitial', handle],
    () => getSquadMembers(squadId),
    { enabled: isFetched && !!squadId },
  );

  if (!squad) {
    return null;
  }

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex flex-row justify-between">
        <SourceButton source={squad} size={ProfileImageSize.XXXLarge} />
        <SquadMemberShortList
          squad={squad}
          members={squadMembers}
          className="h-10"
        />
      </div>
      <h3 className="mt-3 text-text-primary typo-title2">{squad.name}</h3>
      <h4 className="text-text-tertiary typo-callout">{`@${squad.handle}`}</h4>
      {squad.description && (
        <p className="mt-1 text-text-tertiary typo-callout">
          {squad.description}
        </p>
      )}
      <SquadJoinButton
        className={{ button: 'mt-3 w-full' }}
        squad={squad}
        origin={Origin.ArticleModal}
      />
      {!squad.currentMember && (
        <p className="mt-3 text-text-tertiary typo-callout">
          Join Squad to see more posts from {squad.name}
        </p>
      )}
    </div>
  );
};

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

  return (
    <PageWidgets className={className}>
      <PostHeaderActions
        post={post}
        onClose={onClose}
        className="hidden pt-6 tablet:flex"
        contextMenuId="post-widgets-context"
      />
      {!!squad && !squad.currentMember && <SquadCard squadSource={squad} />}
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
