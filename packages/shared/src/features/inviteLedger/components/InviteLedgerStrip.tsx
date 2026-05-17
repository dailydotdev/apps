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
  MiniCloseIcon,
  SparkleIcon,
  ArrowIcon,
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
        'group relative mx-4 mb-2 flex items-center gap-3 overflow-hidden rounded-12 px-3',
        'border-accent-cabbage-default/30 border',
        'bg-gradient-to-r from-accent-cabbage-subtlest via-surface-float to-accent-onion-subtlest',
        'hover:border-accent-cabbage-default/50 transition-all duration-200 ease-out hover:shadow-2-cabbage',
        'typo-callout',
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-6 -top-6 size-20 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="bg-accent-onion-default/15 pointer-events-none absolute -bottom-6 -right-6 size-20 rounded-full blur-2xl"
      />

      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-10 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-[0_4px_12px_-2px_rgba(206,134,253,0.5)]">
        <SparkleIcon size={IconSize.Size16} secondary />
      </span>

      <span className="relative min-w-0 flex-1 truncate">
        <strong className="font-bold text-text-primary">{headline}</strong>
        <span className="text-text-secondary">
          {' '}
          joined through your invite.{' '}
          <strong className="text-accent-cheese-bolder">
            +{coresAdded} Cores
          </strong>
        </span>
      </span>

      <button
        type="button"
        className="hidden items-center gap-1 whitespace-nowrap rounded-10 bg-accent-cabbage-default px-3 py-1 font-bold text-white shadow-[0_2px_6px_-1px_rgba(206,134,253,0.4)] transition-transform duration-150 typo-footnote hover:scale-105 hover:shadow-2-cabbage tablet:inline-flex"
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
        className="relative rounded-8 p-1 text-text-tertiary transition-colors hover:bg-surface-float hover:text-text-primary"
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
