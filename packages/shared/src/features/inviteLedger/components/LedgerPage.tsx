import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { InviteLinkInput } from '../../../components/referral';
import { useInviteLedger } from '../useInviteLedger';
import { getInviteLedgerDemoMode, setInviteLedgerDemoMode } from '../debug';
import {
  getCurrentInviteTier,
  getInviteTierProgress,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';
import type { InviteMilestone } from '../milestones';
import { InviteMilestoneTimeline } from './InviteMilestoneTimeline';
import { LedgerTable } from './LedgerTable';
import { ChannelChips } from './ChannelChips';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

const DEMO_MODES = ['full', 'single', 'empty'] as const;

const getHeroHeadline = (invitesAccepted: number): string => {
  if (invitesAccepted === 0) {
    return 'No one has joined through you yet.';
  }
  if (invitesAccepted === 1) {
    return 'One developer joined daily.dev through your link.';
  }
  return `${invitesAccepted} developers joined daily.dev through your link.`;
};

const getHeroSubhead = ({
  invitesAccepted,
  invitesAway,
  next,
}: {
  invitesAccepted: number;
  invitesAway: number;
  next: InviteMilestone | null;
}): string => {
  if (invitesAccepted === 0) {
    return 'Six rewards sit on the other side of your invite link. The first one needs one developer to join.';
  }
  if (!next) {
    return 'You\u2019re at the top of the ladder. Future bring-ins keep adding Cores.';
  }
  const awayLabel = invitesAway === 1 ? 'One more' : `${invitesAway} more`;
  return `${awayLabel} to reach ${next.title.toLowerCase()}.`;
};

interface StatCellProps {
  label: string;
  value: number;
  unit?: string;
  faded?: boolean;
}

const StatCell = ({
  label,
  value,
  unit,
  faded,
}: StatCellProps): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <span className="font-mono uppercase tracking-[0.12em] text-text-tertiary typo-caption2">
      {label}
    </span>
    <span className="flex items-baseline gap-1">
      <span
        className={classNames(
          'font-bold tabular-nums typo-title3',
          faded ? 'text-text-tertiary' : 'text-text-primary',
        )}
      >
        {value.toLocaleString('en-US')}
      </span>
      {unit && <span className="text-text-tertiary typo-footnote">{unit}</span>}
    </span>
  </div>
);

export const LedgerPage = (): ReactElement => {
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const demoMode = getInviteLedgerDemoMode();

  const { invitesAccepted } = ledger;
  const current = getCurrentInviteTier(invitesAccepted);
  const next = getNextInviteMilestone(invitesAccepted);
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);
  const progress = getInviteTierProgress(invitesAccepted);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.InviteLedgerViewed,
      target_type: TargetType.InviteLedgerPage,
    });
  }, [logEvent]);

  return (
    <div className="flex flex-col gap-6">
      {demoMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-10 border border-border-subtlest-secondary bg-surface-float px-3 py-1.5 font-mono text-text-secondary typo-caption2">
          <span className="uppercase tracking-[0.12em]">demo: {demoMode}</span>
          <span className="ml-auto flex flex-wrap gap-1">
            {DEMO_MODES.filter((m) => m !== demoMode).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setInviteLedgerDemoMode(mode);
                  window.location.reload();
                }}
                className="rounded-6 border border-border-subtlest-secondary px-1.5 py-0.5 hover:bg-surface-hover hover:text-text-primary"
              >
                {mode}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setInviteLedgerDemoMode(null);
                window.location.reload();
              }}
              className="rounded-6 border border-border-subtlest-secondary px-1.5 py-0.5 hover:bg-surface-hover hover:text-text-primary"
            >
              real
            </button>
          </span>
        </div>
      )}

      {/* Hero — editorial fact */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-text-tertiary typo-caption1">
          <span className="font-mono uppercase tracking-[0.12em]">
            Invite ledger
          </span>
          <span aria-hidden>·</span>
          {current ? (
            <span className="font-semibold text-accent-cabbage-default">
              {current.title}
            </span>
          ) : (
            <span>No tier yet</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="font-bold text-text-primary typo-title2">
            {getHeroHeadline(invitesAccepted)}
          </h2>
          <p className="text-text-secondary typo-callout">
            {getHeroSubhead({ invitesAccepted, invitesAway, next })}
          </p>
        </div>

        {next && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-text-tertiary typo-caption1">
              <span className="truncate">
                Next tier:{' '}
                <span className="font-semibold text-text-primary">
                  {next.title}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">
                {invitesAccepted}/{next.invites}
              </span>
            </div>
            <div
              className="relative h-1.5 overflow-hidden rounded-full bg-surface-float"
              role="progressbar"
              aria-label={`Progress toward ${next.title}`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent-cabbage-default transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-6 gap-y-3 border-y border-border-subtlest-secondary py-4">
          <StatCell label="Developers in" value={invitesAccepted} />
          <StatCell
            label="Cores earned"
            value={ledger.coresGiftedToFriends}
            faded={ledger.coresGiftedToFriends === 0}
          />
          <StatCell
            label="Plus days gifted"
            value={ledger.plusDaysGiftedToFriends}
            unit={ledger.plusDaysGiftedToFriends === 1 ? 'day' : 'days'}
            faded={ledger.plusDaysGiftedToFriends === 0}
          />
        </div>
      </section>

      {/* Invite link */}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-bold text-text-primary typo-callout">
            Your invite link
          </h3>
          <span className="text-text-tertiary typo-caption1">
            One per account, never changes.
          </span>
        </div>
        <InviteLinkInput
          link={ledger.inviteUrl}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteLedgerPage,
          }}
        />
        <ChannelChips link={ledger.inviteUrl} />
      </section>

      {/* Reward path */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-bold text-text-primary typo-callout">
            What unlocks at each step
          </h3>
          <span className="text-text-tertiary typo-caption1">
            Six steps. Each gets bigger.
          </span>
        </div>
        <InviteMilestoneTimeline invitesAccepted={invitesAccepted} showBlurb />
      </section>

      {/* Who joined */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-bold text-text-primary typo-callout">
            Who joined
          </h3>
          <span className="text-text-tertiary typo-caption1">
            {ledger.rows.length === 0
              ? 'No entries yet'
              : `${ledger.rows.length} ${
                  ledger.rows.length === 1 ? 'entry' : 'entries'
                }`}
          </span>
        </div>

        <div className="-mx-2 overflow-x-auto">
          <LedgerTable rows={ledger.rows} isLoading={ledger.isLoading} />
        </div>

        {ledger.hasNextPage && (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              loading={ledger.isFetchingNextPage}
              onClick={() => ledger.fetchNextPage()}
            >
              Load more
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
