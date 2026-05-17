import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedger } from '../useInviteLedger';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { isStripDismissed, setStripDismissed } from '../debug';
import { ArrowIcon, MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface InviteLedgerStripProps {
  className?: string;
}

const STRIP_HEIGHT_CLASS = 'h-10';

const buildHeadline = (joinedNames: string[]): string => {
  if (joinedNames.length === 0) {
    return '';
  }
  if (joinedNames.length === 1) {
    return joinedNames[0];
  }
  if (joinedNames.length === 2) {
    return `${joinedNames[0]} and ${joinedNames[1]}`;
  }
  return `${joinedNames[0]}, ${joinedNames[1]} +${joinedNames.length - 2}`;
};

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
        'mx-4 mb-2 flex items-center gap-2 rounded-10 border border-border-subtlest-secondary bg-surface-float px-3 typo-footnote',
        className,
      )}
    >
      <span className="font-mono uppercase tracking-[0.12em] text-text-tertiary typo-caption2">
        Invite ledger
      </span>
      <span aria-hidden className="text-text-tertiary">
        ·
      </span>
      <span className="min-w-0 flex-1 truncate text-text-primary">
        <strong className="font-bold">{headline}</strong>
        <span className="text-text-secondary"> joined through you. </span>
        <span className="font-semibold text-accent-cheese-default">
          +{coresAdded.toLocaleString('en-US')} Cores
        </span>
      </span>

      <button
        type="button"
        className="hidden items-center gap-1 rounded-6 border border-border-subtlest-secondary px-2 py-1 font-semibold text-text-secondary typo-caption1 hover:border-text-secondary hover:bg-surface-hover hover:text-text-primary tablet:inline-flex"
        onClick={() => {
          logEvent({
            event_name: LogEvent.InviteLedgerStripClick,
            target_type: TargetType.InviteLedgerStrip,
          });
          router.push('/settings/referrals');
        }}
      >
        Open ledger
        <ArrowIcon size={IconSize.Size16} className="rotate-90" />
      </button>

      <button
        type="button"
        aria-label="Dismiss"
        className="rounded-6 p-1 text-text-tertiary hover:bg-surface-hover hover:text-text-primary"
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
