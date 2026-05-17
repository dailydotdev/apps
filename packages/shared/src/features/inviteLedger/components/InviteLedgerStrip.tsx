import type { ReactElement } from 'react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import AuthContext from '../../../contexts/AuthContext';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { useInviteLedger } from '../useInviteLedger';
import { INVITE_LEDGER_CORES_PER_INVITE } from '../types';
import { getInvitesUntilNextTier, getNextInviteMilestone } from '../milestones';

const DISMISS_KEY_PREFIX = 'inviteLedgerStripDismissed:';

const safeWindow = (): Window | null =>
  typeof window === 'undefined' ? null : window;

const getDismissedCohort = (): string | null => {
  const win = safeWindow();
  if (!win) {
    return null;
  }
  return win.localStorage.getItem(`${DISMISS_KEY_PREFIX}cohort`);
};

const setDismissedCohort = (cohort: string): void => {
  const win = safeWindow();
  if (!win) {
    return;
  }
  win.localStorage.setItem(`${DISMISS_KEY_PREFIX}cohort`, cohort);
};

const formatNames = (names: string[]): string => {
  if (names.length === 0) {
    return '';
  }
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
};

/**
 * The Wire.
 *
 * A single editorial sentence at the top of the home feed when a friend
 * has signed up recently. Reads like a wire-service bulletin:
 *
 *   WIRE · @yael.dev and @petraq joined through your link ·
 *   +400 Cores · 5 to Double-digit territory →
 */
export const InviteLedgerStrip = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const isEnabled = useInviteLedgerEnabled();
  const ledger = useInviteLedger();
  const impressionLogged = useRef(false);

  const [dismissedCohort, setDismissedCohortState] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setDismissedCohortState(getDismissedCohort());
  }, []);

  const cohort = ledger.newsCohortKey;
  const hidden =
    !user?.id ||
    !isEnabled ||
    !ledger.hasNews ||
    !cohort ||
    cohort === dismissedCohort;

  useEffect(() => {
    if (hidden || impressionLogged.current) {
      return;
    }
    impressionLogged.current = true;
    logEvent({
      event_name: LogEvent.InviteLedgerStripImpression,
      target_type: TargetType.InviteLedgerStrip,
      extra: JSON.stringify({ cohort }),
    });
  }, [hidden, cohort, logEvent]);

  const next = useMemo(
    () => getNextInviteMilestone(ledger.invitesAccepted),
    [ledger.invitesAccepted],
  );
  const invitesAway = getInvitesUntilNextTier(ledger.invitesAccepted);

  if (hidden) {
    return null;
  }

  const names = ledger.recentJoins
    .map((row) => (row.user.username ? `@${row.user.username}` : row.user.name))
    .filter((n): n is string => Boolean(n));
  const verb = names.length === 1 ? 'joined' : 'joined';
  const coresEarned =
    ledger.recentJoins.length * INVITE_LEDGER_CORES_PER_INVITE;

  const tierTail =
    next && invitesAway > 0 ? ` · ${invitesAway} to ${next.title}` : '';

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.InviteLedgerStripClick,
      target_type: TargetType.InviteLedgerStrip,
      extra: JSON.stringify({ cohort }),
    });
    router.push('/settings/referrals');
  };

  const handleDismiss = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDismissedCohort(cohort);
    setDismissedCohortState(cohort);
    logEvent({
      event_name: LogEvent.InviteLedgerStripDismiss,
      target_type: TargetType.InviteLedgerStrip,
      extra: JSON.stringify({ cohort }),
    });
  };

  return (
    <div className="px-4 pb-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={classNames(
          'group flex items-center gap-3 rounded-10 border border-border-subtlest-secondary bg-surface-float px-3 py-2',
          'cursor-pointer transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover',
        )}
      >
        <span className="shrink-0 font-mono font-semibold uppercase tracking-[0.18em] text-accent-cabbage-default typo-caption2">
          Wire
        </span>
        <span aria-hidden className="shrink-0 text-text-quaternary">
          ·
        </span>
        <p className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
          <span className="font-semibold">{formatNames(names)}</span>{' '}
          <span className="text-text-secondary">{verb} through your link</span>
          <span className="text-text-quaternary"> · </span>
          <span className="font-mono tabular-nums text-accent-avocado-default">
            +{coresEarned.toLocaleString('en-US')} Cores
          </span>
          <span className="font-mono text-text-tertiary">{tierTail}</span>
        </p>
        <span
          aria-hidden
          className="shrink-0 font-mono text-text-tertiary group-hover:text-text-primary"
        >
          →
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss wire"
          className="shrink-0 font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2 hover:text-text-primary"
        >
          ×
        </button>
      </div>
    </div>
  );
};
