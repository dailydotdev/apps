import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useInviteLedger } from '../useInviteLedger';
import { useInviteLedgerEnabled } from '../useInviteLedgerEnabled';
import { isStripDismissed, setStripDismissed } from '../debug';
import {
  ArrowIcon,
  MiniCloseIcon,
  SparkleIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface InviteLedgerStripProps {
  className?: string;
}

const STRIP_HEIGHT_CLASS = 'h-12';

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
        'mx-4 mb-2 flex items-center gap-3 rounded-12 border border-border-subtlest-secondary bg-background-default px-3',
        className,
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-10 bg-accent-cabbage-bolder text-white">
        <SparkleIcon size={IconSize.Size16} secondary />
      </span>

      <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
        <strong className="font-bold">{headline}</strong>
        <span className="text-text-secondary">
          {' '}
          joined through your invite.
        </span>
        <span className="ml-1 inline-flex items-center gap-0.5 rounded-6 bg-accent-cheese-subtlest px-1.5 py-0.5 font-semibold text-accent-cheese-bolder typo-caption1">
          +{coresAdded} Cores
        </span>
      </span>

      <button
        type="button"
        className="hidden items-center gap-1 whitespace-nowrap rounded-10 bg-accent-cabbage-bolder px-3 py-1.5 font-bold text-white transition-colors typo-footnote hover:bg-accent-cabbage-default tablet:inline-flex"
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
        className="rounded-8 p-1 text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
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
