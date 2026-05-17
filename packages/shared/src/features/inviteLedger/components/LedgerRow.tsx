import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { CoinIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
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
    <tr
      className={classNames(
        'group border-b border-border-subtlest-secondary transition-colors duration-150',
        'hover:bg-surface-float',
      )}
    >
      <td className="px-3 py-3 align-middle tabular-nums text-text-tertiary typo-footnote">
        {format(new Date(user.createdAt), 'MMM d, yyyy')}
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <ProfilePicture
            user={{
              id: user.id,
              username: user.username,
              image: user.image,
            }}
            size={ProfileImageSize.Small}
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold text-text-primary typo-callout">
              {user.name || user.username}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              @{user.username}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 align-middle text-text-secondary typo-footnote">
        {buildGiftLabel(status, coresPerInvite, plusDaysPerInvite)}
      </td>
      <td className="px-3 py-3 text-right align-middle">
        {isJoined ? (
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-text-primary typo-callout">
            <CoinIcon
              size={IconSize.Size16}
              className="text-accent-cheese-default"
              secondary
            />
            {coresToInviter}
          </span>
        ) : (
          <span className="text-text-quaternary">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-right align-middle">
        <LedgerStatusPill status={status} />
      </td>
    </tr>
  );
};
