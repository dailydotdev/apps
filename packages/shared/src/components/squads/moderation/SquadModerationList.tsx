import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { SquadModerationItem } from './SquadModerationItem';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';

export function SquadModerationList(): ReactElement {
  const { onApprove, onReject, isLoading } = useSquadPostModeration();
  const { data } = useSquadPendingPosts();
  const [value] = data;

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
      <SquadModerationItem
        data={value}
        isLoading={isLoading}
        onReject={onReject}
        onApprove={(id) => onApprove([id])}
      />
    </div>
  );
}
