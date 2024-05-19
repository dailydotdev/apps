import React, { ReactNode } from 'react';
import { subDays } from 'date-fns';
import classed from '../../../lib/classed';
import { BlockIcon, LockIcon, TimerIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  PublicSquadRequest,
  PublicSquadRequestStatus,
} from '../../../graphql/sources';

export const StatusDescription = classed(
  'p',
  'typo-subhead text-text-tertiary',
);

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

const remoteStatusMap: Record<PublicSquadRequestStatus, SquadStatus> = {
  [PublicSquadRequestStatus.Approved]: SquadStatus.Approved,
  [PublicSquadRequestStatus.Rejected]: SquadStatus.Rejected,
  [PublicSquadRequestStatus.Pending]: SquadStatus.Pending,
};

export const getSquadStatus = (request: PublicSquadRequest): SquadStatus => {
  if (!request) {
    return SquadStatus.InProgress;
  }

  if (request.status === PublicSquadRequestStatus.Rejected) {
    const fourteenDaysAgo = subDays(new Date(), 14);
    const requestDate = new Date(request.createdAt);
    return fourteenDaysAgo < requestDate
      ? SquadStatus.Rejected
      : SquadStatus.InProgress;
  }

  return remoteStatusMap[request.status];
};
