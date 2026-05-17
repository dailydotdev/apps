import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';
import { getCurrentInviteTier } from '../milestones';

/**
 * Compact ledger badge rendered next to the user's handle on their own
 * profile. Single accent dot, count, tier title. Reads like a fact, not
 * like a marketing badge.
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
        'inline-flex items-center gap-1.5 rounded-6 px-2 py-1 transition-colors typo-caption1',
        'border border-border-subtlest-secondary bg-surface-float text-text-secondary',
        'hover:border-text-secondary hover:text-text-primary',
      )}
      onClick={() => {
        logEvent({
          event_name: LogEvent.InviteLedgerCounterClick,
          target_type: TargetType.InviteLedgerCounter,
        });
        router.push('/settings/referrals');
      }}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-accent-cabbage-default"
      />
      <span className="font-bold tabular-nums text-text-primary">
        {ledger.invitesAccepted}
      </span>
      <span>{ledger.invitesAccepted === 1 ? 'bring-in' : 'bring-ins'}</span>
      {current && (
        <>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <span className="text-text-primary">{current.title}</span>
        </>
      )}
    </button>
  );
};
