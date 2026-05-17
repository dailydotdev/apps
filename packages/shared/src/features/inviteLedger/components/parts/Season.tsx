import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../../components/ProfilePicture';
import type { InviteLedgerRow } from '../../types';

interface SeasonProps {
  rows: InviteLedgerRow[];
  isLoading?: boolean;
  className?: string;
  emptyHint?: string;
}

const STATUS_TONE: Record<InviteLedgerRow['status'], string> = {
  joined: 'text-accent-avocado-default',
  pending: 'text-accent-cheese-default',
  expired: 'text-text-quaternary',
};

const STATUS_TAG: Record<InviteLedgerRow['status'], string> = {
  joined: 'joined',
  pending: 'pending',
  expired: 'expired',
};

const formatLine = (row: InviteLedgerRow): string => {
  if (row.status === 'joined') {
    return `+${row.coresToInviter} Cores`;
  }
  if (row.status === 'pending') {
    return 'reserved';
  }
  return '—';
};

/**
 * The season log. Each row is a line in the report:
 *   MAY 15   yael.dev          joined    +200 Cores
 * Dense, monospace dates, no badges or chips — just typed columns.
 */
export const Season = ({
  rows,
  isLoading,
  className,
  emptyHint = 'No bring-ins yet. Filed lines show up here the moment a friend joins.',
}: SeasonProps): ReactElement => {
  if (isLoading) {
    return (
      <div
        className={classNames(
          'flex flex-col py-2 font-mono text-text-tertiary typo-caption1',
          className,
        )}
      >
        Reading the wire…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p
        className={classNames(
          'py-2 text-text-tertiary typo-callout',
          className,
        )}
      >
        {emptyHint}
      </p>
    );
  }

  return (
    <ol className={classNames('flex flex-col', className)}>
      {rows.map((row, idx) => {
        const created = new Date(row.user.createdAt);
        const date = format(created, 'MMM d').toUpperCase();
        return (
          <li
            key={row.user.id}
            className={classNames(
              'grid grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 py-2',
              idx > 0 && 'border-t border-border-subtlest-tertiary',
            )}
          >
            <span className="font-mono uppercase tracking-[0.1em] text-text-quaternary typo-caption2">
              {date}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <ProfilePicture
                user={row.user}
                size={ProfileImageSize.XSmall}
                rounded="full"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-bold text-text-primary typo-footnote">
                  {row.user.name ?? row.user.username}
                </span>
                {row.user.username && (
                  <span className="truncate font-mono text-text-tertiary typo-caption2">
                    @{row.user.username}
                  </span>
                )}
              </span>
            </span>
            <span
              className={classNames(
                'font-mono uppercase tracking-[0.12em] typo-caption2',
                STATUS_TONE[row.status],
              )}
            >
              {STATUS_TAG[row.status]}
            </span>
            <span className="font-mono tabular-nums text-text-secondary typo-caption1">
              {formatLine(row)}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
