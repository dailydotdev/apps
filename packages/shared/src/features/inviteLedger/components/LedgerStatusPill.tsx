import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { InviteLedgerRowStatus } from '../useInviteLedger';

interface LedgerStatusPillProps {
  status: InviteLedgerRowStatus;
}

const statusLabel: Record<InviteLedgerRowStatus, string> = {
  joined: 'Joined',
  pending: 'Pending',
  expired: 'Expired',
};

const statusClassName: Record<InviteLedgerRowStatus, string> = {
  joined: 'bg-action-upvote-float text-action-upvote-default',
  pending: 'bg-action-bookmark-float text-action-bookmark-default',
  expired: 'bg-surface-float text-text-quaternary',
};

export const LedgerStatusPill = ({
  status,
}: LedgerStatusPillProps): ReactElement => (
  <span
    className={classNames(
      'rounded inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]',
      statusClassName[status],
    )}
  >
    {statusLabel[status]}
  </span>
);
