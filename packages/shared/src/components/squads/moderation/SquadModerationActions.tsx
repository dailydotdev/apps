import React, { MouseEventHandler, ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { BlockIcon, VIcon } from '../../icons';

interface SquadModerationActionsProps {
  onApprove: MouseEventHandler;
  onReject: MouseEventHandler;
  isLoading?: boolean;
}

export function SquadModerationActions({
  onApprove,
  onReject,
  isLoading,
}: SquadModerationActionsProps): ReactElement {
  return (
    <div className="flex w-full flex-row gap-4">
      <Button
        size={ButtonSize.Small}
        className="flex-1"
        disabled={isLoading}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        onClick={onReject}
      >
        Decline
      </Button>
      <Button
        size={ButtonSize.Small}
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
