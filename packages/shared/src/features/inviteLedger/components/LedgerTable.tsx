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
  'px-3 pt-4 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] font-medium text-text-quaternary border-b border-border-subtlest-tertiary';

export const LedgerTable = ({
  rows,
  isLoading,
  className,
}: LedgerTableProps): ReactElement => {
  if (isLoading) {
    return (
      <div className="py-10 text-center font-mono text-[12px] text-text-tertiary">
        Loading ledger\u2026
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center font-mono text-[12px] text-text-tertiary">
        No invites yet. Share your link.
      </div>
    );
  }

  return (
    <table className={classNames('w-full border-collapse', className)}>
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
