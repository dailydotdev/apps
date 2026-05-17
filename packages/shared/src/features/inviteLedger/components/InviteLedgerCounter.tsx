import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';
import { AddUserIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

/**
 * Small accent pill rendered next to the user's handle on their own profile.
 * Public-facing surface (visitors see the count, not the cores).
 */
export const InviteLedgerCounter = (): ReactElement | null => {
  const isEnabled = useInviteLedgerEnabled();
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const router = useRouter();

  if (!isEnabled || ledger.invitesAccepted < 1) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        'group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-200 ease-out',
        'border-accent-cabbage-default/30 border bg-accent-cabbage-subtlest',
        'hover:border-accent-cabbage-default/60 hover:-translate-y-px hover:shadow-2-cabbage',
        'typo-caption1',
      )}
      onClick={() => {
        logEvent({
          event_name: LogEvent.InviteLedgerCounterClick,
          target_type: TargetType.InviteLedgerCounter,
        });
        router.push('/settings/referrals');
      }}
    >
      <AddUserIcon
        size={IconSize.Size16}
        className="text-accent-cabbage-default"
        secondary
      />
      <span className="bg-gradient-to-r from-accent-cabbage-bolder to-accent-onion-default bg-clip-text font-bold tabular-nums text-transparent">
        {ledger.invitesAccepted}
      </span>
      <span className="text-accent-cabbage-bolder">
        {ledger.invitesAccepted === 1 ? 'invite' : 'invites'}
      </span>
    </button>
  );
};
