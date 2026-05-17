import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import AuthContext from '../../../contexts/AuthContext';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';
import { formatStep, getCurrentInviteTier } from '../milestones';

/**
 * The Stamp.
 *
 * A tiny monospace pill that lives next to the user's handle in their
 * own profile header. Reads like a stamp on a field report:
 *
 *   LEDGER №3 · 5 IN
 */
export const InviteLedgerCounter = (): ReactElement | null => {
  const { user } = useContext(AuthContext);
  const isEnabled = useInviteLedgerEnabled();
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();

  if (!user?.id || !isEnabled) {
    return null;
  }

  const tier = getCurrentInviteTier(ledger.invitesAccepted);

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.InviteLedgerCounterClick,
      target_type: TargetType.InviteLedgerCounter,
      extra: JSON.stringify({
        invites: ledger.invitesAccepted,
        tier: tier?.step ?? 0,
      }),
    });
  };

  return (
    <Link href="/settings/referrals" passHref>
      <a
        href="/settings/referrals"
        onClick={handleClick}
        aria-label={
          tier
            ? `Invite ledger: tier ${tier.step} (${tier.title}), ${ledger.invitesAccepted} bring-ins`
            : `Invite ledger: ${ledger.invitesAccepted} bring-ins`
        }
        className={classNames(
          'inline-flex items-center gap-1.5 rounded-6 border border-border-subtlest-secondary bg-surface-float px-1.5 py-0.5',
          'font-mono uppercase tracking-[0.14em] text-text-secondary typo-caption2',
          'transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary',
        )}
      >
        <span className="font-semibold">Ledger</span>
        {tier && (
          <>
            <span aria-hidden className="text-text-quaternary">
              ·
            </span>
            <span className="tabular-nums">№{formatStep(tier.step)}</span>
          </>
        )}
        <span aria-hidden className="text-text-quaternary">
          ·
        </span>
        <span className="tabular-nums text-text-primary">
          {ledger.invitesAccepted} in
        </span>
      </a>
    </Link>
  );
};
