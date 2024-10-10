import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import { SourceMemberRole, Squad } from '../../../graphql/sources';
import { SquadEmptyScreen } from './SquadEmptyScreen';
import { ElementPlaceholder } from '../../ElementPlaceholder';

const placeholder = (
  <div className="flex w-full flex-col gap-4 p-6">
    <span className="flex flex-row">
      <ElementPlaceholder className="h-10 w-10 rounded-full" />
      <div className="ml-4 flex flex-col gap-1">
        <ElementPlaceholder className="h-3 w-20 rounded-12" />
        <ElementPlaceholder className="mt-1 h-3 w-32 rounded-12" />
      </div>
    </span>
    <div className="flex flex-row gap-16">
      <div className="flex flex-1 flex-col gap-2">
        <ElementPlaceholder className="h-4 w-full rounded-12" />
        <ElementPlaceholder className="h-4 w-2/3 rounded-12" />
        <span className="mt-4 flex flex-row flex-wrap gap-4">
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
          <ElementPlaceholder className="h-6 w-10 rounded-4" />
        </span>
      </div>
      <ElementPlaceholder className="ml-auto h-36 w-60 rounded-32" />
    </div>
    <div className="flex flex-row gap-4">
      <ElementPlaceholder className="h-8 flex-1 rounded-12" />
      <ElementPlaceholder className="h-8 flex-1 rounded-12" />
    </div>
  </div>
);

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
        <div className="flex flex-col gap-4">
          {placeholder}
          {placeholder}
        </div>
      );
    }

    if (squad.currentMember.role === SourceMemberRole.Member) {
      return (
        <SquadEmptyScreen
          Icon={VIcon}
          title="All done!"
          description="All caught up! No posts are pending" // TODO:: MI-597 - check with product what to show here
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
            onClick={() => onApprove(data.map((request) => request.id))}
          >
            Approve all {data.length} posts
          </Button>
        </span>
      )}
      {data?.map((request) => (
        <SquadModerationItem
          key={request.id}
          squad={squad}
          data={request}
          isLoading={isLoading}
          onReject={onReject}
          onApprove={(id) => onApprove([id])}
        />
      ))}
    </div>
  );
}
