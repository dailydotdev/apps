import React, { ReactNode } from 'react';
import { BlockIcon, LockIcon, TimerIcon } from '../../icons';
import { IconSize } from '../../Icon';

export enum SquadStatus {
  InProgress = 'in-progress',
  Pending = 'pending',
  Rejected = 'rejected',
  Approved = 'approved',
}

export const badge: Record<SquadStatus, ReactNode> = {
  [SquadStatus.InProgress]: <LockIcon size={IconSize.Small} />,
  [SquadStatus.Pending]: <TimerIcon size={IconSize.Small} />,
  [SquadStatus.Rejected]: <BlockIcon size={IconSize.Small} />,
  [SquadStatus.Approved]: null,
};
