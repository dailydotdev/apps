import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant } from '../../buttons/common';
import { BlockIcon, VIcon } from '../../icons';

interface SquadModerationActionsProps {
  onApprove(): void;
  onReject(): void;
  isLoading: boolean;
}

export function SquadModerationActions({
  onApprove,
  onReject,
  isLoading,
}: SquadModerationActionsProps): ReactElement {
  return (
    <div className="flex w-full flex-row gap-4">
      <Button
        className="flex-1"
        disabled={isLoading}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        onClick={onReject}
      >
        Decline
      </Button>
      <Button
        className="flex-1"
        disabled={isLoading}
        variant={ButtonVariant.Primary}
        icon={<VIcon secondary />}
        onClick={onApprove}
      >
        Approve
      </Button>
    </div>
  );
}
