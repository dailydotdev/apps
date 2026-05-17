import type { ReactElement } from 'react';
import React from 'react';
import { format } from 'date-fns';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
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
  return `${coresPerInvite} Cores · ${plusDaysPerInvite} Plus days`;
};

export const LedgerRow = ({
  row,
  coresPerInvite,
  plusDaysPerInvite,
}: LedgerRowProps): ReactElement => {
  const { user, status, coresToInviter } = row;
  const isJoined = status === 'joined';
  return (
    <tr className="border-b border-border-subtlest-tertiary transition-colors hover:bg-surface-float">
      <td className="px-3 py-2.5 align-middle tabular-nums text-text-tertiary typo-caption1">
        {format(new Date(user.createdAt), 'MMM d')}
      </td>
      <td className="px-3 py-2.5 align-middle">
        <div className="flex items-center gap-2">
          <ProfilePicture
            user={{
              id: user.id,
              username: user.username,
              image: user.image,
            }}
            size={ProfileImageSize.XSmall}
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold text-text-primary typo-footnote">
              {user.name || user.username}
            </span>
            <span className="truncate text-text-tertiary typo-caption2">
              @{user.username}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-2.5 align-middle text-text-secondary typo-caption1 tablet:table-cell">
        {buildGiftLabel(status, coresPerInvite, plusDaysPerInvite)}
      </td>
      <td className="px-3 py-2.5 text-right align-middle">
        {isJoined ? (
          <span className="font-bold tabular-nums text-text-primary typo-footnote">
            +{coresToInviter}
          </span>
        ) : (
          <span className="text-text-quaternary">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right align-middle">
        <LedgerStatusPill status={status} />
      </td>
    </tr>
  );
};
