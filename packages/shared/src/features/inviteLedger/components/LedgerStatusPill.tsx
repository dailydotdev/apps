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

const statusDot: Record<InviteLedgerRowStatus, string> = {
  joined: 'bg-accent-avocado-default shadow-[0_0_6px_rgba(124,217,150,0.6)]',
  pending: 'bg-accent-cheese-default animate-pulse',
  expired: 'bg-text-quaternary',
};

const statusChip: Record<InviteLedgerRowStatus, string> = {
  joined:
    'bg-accent-avocado-subtlest text-accent-avocado-default ring-accent-avocado-default/20',
  pending:
    'bg-accent-cheese-subtlest text-accent-cheese-default ring-accent-cheese-default/20',
  expired: 'bg-surface-float text-text-tertiary ring-border-subtlest-secondary',
};

export const LedgerStatusPill = ({
  status,
}: LedgerStatusPillProps): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-10 px-2 py-0.5 font-semibold ring-1 typo-caption2',
      statusChip[status],
    )}
  >
    <span
      aria-hidden
      className={classNames('size-1.5 rounded-full', statusDot[status])}
    />
    {statusLabel[status]}
  </span>
);
