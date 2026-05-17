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

const statusChip: Record<InviteLedgerRowStatus, string> = {
  joined: 'bg-accent-avocado-subtlest text-accent-avocado-default',
  pending: 'bg-accent-cheese-subtlest text-accent-cheese-default',
  expired: 'bg-surface-float text-text-tertiary',
};

export const LedgerStatusPill = ({
  status,
}: LedgerStatusPillProps): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center rounded-6 px-1.5 py-0.5 font-semibold typo-caption2',
      statusChip[status],
    )}
  >
    {statusLabel[status]}
  </span>
);
