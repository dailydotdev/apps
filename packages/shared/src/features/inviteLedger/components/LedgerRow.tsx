import type { ReactElement } from 'react';
import React from 'react';
import { format } from 'date-fns';
import { LedgerStatusPill } from './LedgerStatusPill';
import type { InviteLedgerRow } from '../useInviteLedger';

interface LedgerRowProps {
  row: InviteLedgerRow;
  coresPerInvite: number;
  plusDaysPerInvite: number;
}

const buildGiftLabel = (
  status: InviteLedgerRow['status'],
  coresPerInvite: number,
  plusDaysPerInvite: number,
): string => {
  if (status === 'expired') {
    return 'No response';
  }
  if (status === 'pending') {
    return `${coresPerInvite} Cores reserved`;
  }
  return `${coresPerInvite} Cores + ${plusDaysPerInvite} Plus days`;
};

export const LedgerRow = ({
  row,
  coresPerInvite,
  plusDaysPerInvite,
}: LedgerRowProps): ReactElement => {
  const { user, status, coresToInviter } = row;
  return (
    <tr className="hover:bg-surface-float/30 border-b border-border-subtlest-tertiary">
      <td className="px-3 py-3.5 align-top font-mono text-[12.5px] tabular-nums text-text-secondary">
        {format(new Date(user.createdAt), 'yyyy-MM-dd')}
      </td>
      <td className="px-3 py-3.5 align-top font-mono text-[12.5px] font-medium text-text-primary">
        @{user.username}
      </td>
      <td className="px-3 py-3.5 align-top text-[12.5px] italic text-text-tertiary">
        {buildGiftLabel(status, coresPerInvite, plusDaysPerInvite)}
      </td>
      <td className="px-3 py-3.5 text-right align-top font-mono text-[12.5px] tabular-nums text-text-secondary">
        {status === 'joined' ? coresToInviter : '\u2014'}
      </td>
      <td className="px-3 py-3.5 text-right align-top">
        <LedgerStatusPill status={status} />
      </td>
    </tr>
  );
};
