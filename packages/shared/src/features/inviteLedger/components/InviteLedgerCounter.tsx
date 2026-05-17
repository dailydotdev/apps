import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';

/**
 * Small mono pill rendered next to the user's handle on their own profile.
 * Public-facing surface (visitors see the count, not the cores). Renders
 * only when count >= 1 so "0 invites" never appears as a pill.
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
      className="inline-flex items-center gap-1.5 rounded-full border border-border-subtlest-tertiary px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary hover:border-text-tertiary"
      onClick={() => {
        logEvent({
          event_name: LogEvent.InviteLedgerCounterClick,
          target_type: TargetType.InviteLedgerCounter,
        });
        router.push('/settings/referrals');
      }}
    >
      <b className="font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
        {ledger.invitesAccepted}
      </b>
      developers brought in
    </button>
  );
};
