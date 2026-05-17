import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedger } from '../useInviteLedger';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { isStripDismissed, setStripDismissed } from '../debug';
import { MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface InviteLedgerStripProps {
  className?: string;
}

const STRIP_HEIGHT_CLASS = 'h-11'; // 44px exact, prevents CLS

const buildHeadline = (joinedNames: string[]): string => {
  if (joinedNames.length === 0) {
    return '';
  }
  if (joinedNames.length === 1) {
    return `${joinedNames[0]}`;
  }
  if (joinedNames.length === 2) {
    return `${joinedNames[0]} and ${joinedNames[1]}`;
  }
  return `${joinedNames[0]}, ${joinedNames[1]} +${joinedNames.length - 2}`;
};

/**
 * Fixed-height strip placed above the feed. Renders only when there is
 * something to tell the user about (joins in the last 7 days). Height is
 * locked so render/unrender does NOT shift cumulative layout.
 */
export const InviteLedgerStrip = ({
  className,
}: InviteLedgerStripProps): ReactElement | null => {
  const isEnabled = useInviteLedgerEnabled();
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!ledger.newsCohortKey) {
      setIsDismissed(true);
      return;
    }
    setIsDismissed(isStripDismissed(ledger.newsCohortKey));
  }, [ledger.newsCohortKey]);

  const shouldRender =
    isEnabled && ledger.hasNews && !isDismissed && !!ledger.newsCohortKey;

  useEffect(() => {
    if (!shouldRender) {
      return;
    }
    logEvent({
      event_name: LogEvent.InviteLedgerStripImpression,
      target_type: TargetType.InviteLedgerStrip,
      extra: JSON.stringify({ joined: ledger.recentJoins.length }),
    });
  }, [shouldRender, ledger.recentJoins.length, logEvent]);

  if (!shouldRender) {
    return null;
  }

  const headline = buildHeadline(
    ledger.recentJoins.map((row) => `@${row.user.username}`),
  );
  const coresAdded =
    ledger.recentJoins.length * (ledger.recentJoins[0]?.coresToInviter || 0);

  return (
    <div
      className={classNames(
        STRIP_HEIGHT_CLASS,
        'mx-4 mb-2 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 typo-callout',
        className,
      )}
    >
      <span className="rounded hidden border border-border-subtlest-tertiary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-tertiary tablet:inline-block">
        +{ledger.recentJoins.length} joined
      </span>
      <span className="min-w-0 flex-1 truncate">
        <strong className="font-semibold text-text-primary">{headline}</strong>
        <span className="text-text-tertiary">
          {' '}
          joined through your invite this week. {coresAdded} Cores added.
        </span>
      </span>
      <button
        type="button"
        className="hidden whitespace-nowrap border-b border-transparent bg-transparent font-mono text-[12px] text-accent-cabbage-default hover:border-accent-cabbage-default tablet:inline-block"
        onClick={() => {
          logEvent({
            event_name: LogEvent.InviteLedgerStripClick,
            target_type: TargetType.InviteLedgerStrip,
          });
          router.push('/settings/referrals');
        }}
      >
        Open ledger \u2192
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        className="rounded p-1 text-text-quaternary hover:text-text-secondary"
        onClick={() => {
          setStripDismissed(ledger.newsCohortKey);
          setIsDismissed(true);
          logEvent({
            event_name: LogEvent.InviteLedgerStripDismiss,
            target_type: TargetType.InviteLedgerStrip,
          });
        }}
      >
        <MiniCloseIcon size={IconSize.XSmall} />
      </button>
    </div>
  );
};
