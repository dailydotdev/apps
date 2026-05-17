import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';
import { SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { getCurrentInviteTier } from '../milestones';

/**
 * Compact tier badge rendered next to the user's handle on their own profile.
 * Shows current tier label + raw invite count. Public-facing surface
 * (visitors see what tier the user reached).
 */
export const InviteLedgerCounter = (): ReactElement | null => {
  const isEnabled = useInviteLedgerEnabled();
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const router = useRouter();

  if (!isEnabled || ledger.invitesAccepted < 1) {
    return null;
  }

  const current = getCurrentInviteTier(ledger.invitesAccepted);

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors typo-caption1',
        'border border-border-subtlest-secondary bg-surface-float text-text-secondary',
        'hover:border-accent-cabbage-default/40 hover:text-text-primary',
      )}
      onClick={() => {
        logEvent({
          event_name: LogEvent.InviteLedgerCounterClick,
          target_type: TargetType.InviteLedgerCounter,
        });
        router.push('/settings/referrals');
      }}
    >
      <SendAirplaneIcon
        size={IconSize.Size16}
        className="text-accent-cabbage-default"
        secondary
      />
      <span className="font-bold tabular-nums text-text-primary">
        {ledger.invitesAccepted}
      </span>
      {current && <span className="text-text-tertiary">·</span>}
      {current && (
        <span className="font-semibold text-text-primary">{current.label}</span>
      )}
    </button>
  );
};
