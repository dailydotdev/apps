import React, { ReactElement, useContext } from 'react';
import { useQuery } from 'react-query';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext, { useAuthContext } from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import SourceButton from '../cards/SourceButton';
import { SourceMember, Squad } from '../../graphql/sources';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/analytics';
import { useSquad } from '../../hooks';
import { getSquadMembers } from '../../graphql/squads';
import SquadMemberShortList from '../squads/SquadMemberShortList';

interface PostWidgetsProps
  extends Omit<PostModalActionsProps, 'contextMenuId'> {
  origin?: PostOrigin;
}

const SquadCard = ({ squadSource }: { squadSource: Squad }) => {
  const { isFetched } = useAuthContext();
  const { id: squadId, handle } = squadSource;
  const { squad = squadSource } = useSquad({ handle });

  const { data: squadMembers } = useQuery<SourceMember[]>(
    ['squadMembersInitial', handle],
    () => getSquadMembers(squad.id),
    { enabled: isFetched && !!squadId },
  );

  // TODO: FIx this

  return (
    <div className="p-4 rounded-16 border border-theme-divider-tertiary">
      <div className="flex flex-row justify-between">
        <SourceButton source={squad} size="xxxlarge" />
        <SquadMemberShortList
          squad={squad}
          members={squadMembers}
          memberCount={squad.membersCount}
          className="h-10"
        />
      </div>
      <h3 className="mt-3 typo-title2 text-theme-label-primary">
        {squad.name}
      </h3>
      <h4 className="typo-callout text-theme-label-tertiary">{`@${squad.handle}`}</h4>
      {squad.description && (
        <p className="mt-1 typo-callout text-theme-label-tertiary">
          {squad.description}
        </p>
      )}
      <SquadJoinButton
        className="mt-3 w-full"
        squad={squad}
        origin={Origin.ArticleModal}
      />
      {!squad.currentMember && (
        <p className="mt-3 typo-callout text-theme-label-tertiary">
          Join squad to see more posts from {squad.name}
        </p>
      )}
    </div>
  );
};

export function SquadPostWidgets({
  onShare,
  onBookmark,
  post,
  className,
  onClose,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const squad = post.source as Squad;

  return (
    <PageWidgets className={className}>
      <PostModalActions
        onBookmark={onBookmark}
        onShare={onShare}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      {!!squad && !squad.currentMember && <SquadCard squadSource={squad} />}
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
    </PageWidgets>
  );
}
