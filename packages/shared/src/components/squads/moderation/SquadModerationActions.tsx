import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { BlockIcon, VIcon } from '../../icons';

interface SquadModerationActionsProps {
  onApprove: MouseEventHandler;
  onReject: MouseEventHandler;
  isLoading?: boolean;
  className?: string;
}

export function SquadModerationActions({
  onApprove,
  onReject,
  isLoading,
  className,
}: SquadModerationActionsProps): ReactElement {
  return (
    <div className={classNames('flex flex-row gap-2', className)}>
      <Button
        size={ButtonSize.Small}
        className="flex-1 tablet:flex-none"
        disabled={isLoading}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        onClick={onReject}
      >
        Decline
      </Button>
      <Button
        size={ButtonSize.Small}
        className="flex-1 tablet:flex-none"
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
