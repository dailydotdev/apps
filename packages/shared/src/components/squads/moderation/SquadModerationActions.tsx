import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import { ButtonV2 } from '../../buttons/ButtonV2';
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
      <ButtonV2
        size={ButtonSize.Small}
        className="flex-1"
        disabled={isLoading}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        onClick={onReject}
      >
        Decline
      </ButtonV2>
      <ButtonV2
        size={ButtonSize.Small}
        className="flex-1"
        disabled={isLoading}
        variant={ButtonVariant.Primary}
        icon={<VIcon secondary />}
        onClick={onApprove}
      >
        Approve
      </ButtonV2>
    </div>
  );
}
