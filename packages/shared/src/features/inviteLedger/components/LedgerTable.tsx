import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LedgerRow } from './LedgerRow';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from '../useInviteLedger';
import type { InviteLedgerRow } from '../useInviteLedger';

interface LedgerTableProps {
  rows: InviteLedgerRow[];
  isLoading: boolean;
  className?: string;
}

const HEADER_CELL =
  'px-3 pt-4 pb-3 text-left text-text-tertiary typo-caption1 font-semibold border-b border-border-subtlest-secondary';

export const LedgerTable = ({
  rows,
  isLoading,
  className,
}: LedgerTableProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="bg-surface-float/40 flex flex-col items-center gap-3 rounded-14 border border-border-subtlest-secondary py-12 text-text-tertiary typo-callout">
        <span
          aria-hidden
          className="size-2 animate-pulse rounded-full bg-accent-cabbage-default"
        />
        Loading ledger…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-surface-float/40 flex flex-col items-center gap-2 rounded-14 border border-dashed border-border-subtlest-secondary px-6 py-12 text-center">
        <span className="font-bold text-text-primary typo-callout">
          Your ledger is empty
        </span>
        <span className="max-w-sm text-text-tertiary typo-footnote">
          Share your invite link above. Every developer who joins will land here
          with the Cores you earned.
        </span>
      </div>
    );
  }

  return (
    <table
      className={classNames('w-full min-w-[640px] border-collapse', className)}
    >
      <colgroup>
        <col style={{ width: '14%' }} />
        <col style={{ width: '24%' }} />
        <col style={{ width: '34%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '14%' }} />
      </colgroup>
      <thead>
        <tr>
          <th className={HEADER_CELL}>Date</th>
          <th className={HEADER_CELL}>Developer</th>
          <th className={HEADER_CELL}>Gift to them</th>
          <th className={classNames(HEADER_CELL, 'text-right')}>
            Cores you got
          </th>
          <th className={classNames(HEADER_CELL, 'text-right')}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <LedgerRow
            key={row.user.id}
            row={row}
            coresPerInvite={INVITE_LEDGER_CORES_PER_INVITE}
            plusDaysPerInvite={INVITE_LEDGER_PLUS_DAYS_PER_INVITE}
          />
        ))}
      </tbody>
    </table>
  );
};
