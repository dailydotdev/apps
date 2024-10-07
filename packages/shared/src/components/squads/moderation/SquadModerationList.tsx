import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import { SourceMemberRole, Squad } from '../../../graphql/sources';
import { SquadEmptyScreen } from './SquadEmptyScreen';

interface SquadModerationListProps {
  squad: Squad;
}

export function SquadModerationList({
  squad,
}: SquadModerationListProps): ReactElement {
  const { onApprove, onReject, isLoading } = useSquadPostModeration();
  const { data, isFetched } = useSquadPendingPosts(squad?.id);

  if (!data?.length) {
    if (!isFetched || !squad) {
      return (
        <div className="flex flex-col gap-4 p-6">
          <span className="typo-title3">Loading...</span>
        </div>
      );
    }

    if (squad.currentMember.role === SourceMemberRole.Member) {
      return (
        <SquadEmptyScreen
          Icon={VIcon}
          title="All done!"
          description="All caught up! No posts are pending" // check with product what to show here
        />
      );
    }

    return (
      <SquadEmptyScreen
        Icon={VIcon}
        title="All done!"
        description="All caught up! There are no posts waiting for your review right now."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {data?.length > 1 && (
        <span className="flex w-full flex-row justify-end border-b border-border-subtlest-tertiary px-4 py-3">
          <Button
            icon={<VIcon secondary />}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => onApprove(data.map((request) => request.post.id))}
          >
            Approve all {data.length} posts
          </Button>
        </span>
      )}
      {data?.map((request) => (
        <SquadModerationItem
          key={request.post.id}
          data={request}
          isLoading={isLoading}
          onReject={onReject}
          onApprove={(id) => onApprove([id])}
        />
      ))}
    </div>
  );
}
