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
import { InviteMilestoneTimeline } from './InviteMilestoneTimeline';
import { LedgerTable } from './LedgerTable';
import { ChannelChips } from './ChannelChips';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import {
  CoinIcon,
  DevPlusIcon,
  AddUserIcon,
  SendAirplaneIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

const DEMO_MODES = ['full', 'single', 'empty'] as const;

const getHeroHeadline = ({
  invitesAccepted,
  invitesAway,
  next,
}: {
  invitesAccepted: number;
  invitesAway: number;
  next: ReturnType<typeof getNextInviteMilestone>;
}): string => {
  if (invitesAccepted === 0) {
    return 'Bring your first developer in.';
  }
  if (!next) {
    return 'Top tier reached. Every invite still pays.';
  }
  const awayLabel = invitesAway === 1 ? '1 invite' : `${invitesAway} invites`;
  return `${awayLabel} from ${next.label}.`;
};

interface SummaryStatProps {
  icon: ReactElement;
  label: string;
  value: number;
  iconClassName: string;
}

const SummaryStat = ({
  icon,
  label,
  value,
  iconClassName,
}: SummaryStatProps): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-secondary bg-background-default px-4 py-3">
    <span
      className={classNames(
        'flex size-9 shrink-0 items-center justify-center rounded-10',
        iconClassName,
      )}
    >
      {icon}
    </span>
    <div className="flex flex-col leading-tight">
      <span className="text-text-tertiary typo-caption1">{label}</span>
      <span className="font-bold tabular-nums text-text-primary typo-title3">
        {value.toLocaleString('en-US')}
      </span>
    </div>
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
        <div className="border-accent-cabbage-default/40 flex flex-wrap items-center gap-2 rounded-12 border bg-accent-cabbage-subtlest px-3 py-2 text-accent-cabbage-bolder typo-caption1">
          <span className="font-semibold">Demo data: {demoMode}</span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            {DEMO_MODES.filter((m) => m !== demoMode).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setInviteLedgerDemoMode(mode);
                  window.location.reload();
                }}
                className="border-accent-cabbage-default/40 hover:bg-accent-cabbage-default/10 rounded-8 border px-2 py-0.5"
              >
                switch to {mode}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setInviteLedgerDemoMode(null);
                window.location.reload();
              }}
              className="border-accent-cabbage-default/40 hover:bg-accent-cabbage-default/10 rounded-8 border px-2 py-0.5"
            >
              use real data
            </button>
          </span>
        </div>
      )}

      {/* Hero — current tier + progress to next */}
      <section className="relative overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default">
        <span
          aria-hidden
          className="bg-accent-cabbage-default/15 pointer-events-none absolute -left-20 -top-20 size-56 rounded-full blur-3xl"
        />
        <span
          aria-hidden
          className="bg-accent-onion-default/15 pointer-events-none absolute -bottom-10 -right-20 size-48 rounded-full blur-3xl"
        />

        <div className="relative flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-float px-2.5 py-1 text-text-secondary typo-caption1">
              <SendAirplaneIcon
                size={IconSize.Size16}
                className="text-accent-cabbage-default"
                secondary
              />
              Your invite ledger
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-cabbage-subtlest px-2.5 py-1 font-semibold text-accent-cabbage-bolder typo-caption1">
              {current ? current.label : 'Not started'}
            </span>
          </div>

          <div>
            <h2 className="font-bold text-text-primary typo-title1">
              {getHeroHeadline({ invitesAccepted, invitesAway, next })}
            </h2>
            <p className="mt-1 max-w-2xl text-text-secondary typo-body">
              Each developer you bring in unlocks the next reward. The path gets
              bigger the further you go.
            </p>
          </div>

          {next && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2 text-text-tertiary typo-caption1">
                <span>
                  {current?.label ?? 'Start'} → {next.label}
                </span>
                <span className="font-semibold tabular-nums text-text-primary">
                  {invitesAccepted}/{next.invites} invites
                </span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-float">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 mobileL:grid-cols-3">
            <SummaryStat
              icon={<AddUserIcon size={IconSize.Small} secondary />}
              iconClassName="bg-accent-cabbage-subtlest text-accent-cabbage-bolder"
              label="Developers in"
              value={invitesAccepted}
            />
            <SummaryStat
              icon={<CoinIcon size={IconSize.Small} secondary />}
              iconClassName="bg-accent-cheese-subtlest text-accent-cheese-bolder"
              label="Cores earned"
              value={ledger.coresGiftedToFriends}
            />
            <SummaryStat
              icon={<DevPlusIcon size={IconSize.Small} />}
              iconClassName="bg-accent-avocado-subtlest text-accent-avocado-bolder"
              label="Plus days gifted"
              value={ledger.plusDaysGiftedToFriends}
            />
          </div>
        </div>
      </section>

      {/* Invite link + share */}
      <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-secondary bg-background-default p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-text-primary typo-callout">
            Your invite link
          </h3>
          <p className="text-text-secondary typo-footnote">
            Send it to a developer friend. They join, you both win.
          </p>
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
      <section className="flex flex-col gap-4 rounded-16 border border-border-subtlest-secondary bg-background-default p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-text-primary typo-callout">
            The reward path
          </h3>
          <p className="text-text-secondary typo-footnote">
            Six tiers, each bigger than the last.
          </p>
        </div>
        <InviteMilestoneTimeline
          invitesAccepted={invitesAccepted}
          variant="page"
        />
      </section>

      {/* Ledger table */}
      <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-secondary bg-background-default p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-bold text-text-primary typo-callout">
            Who joined
          </h3>
          <span className="text-text-tertiary typo-footnote">
            {ledger.rows.length === 0
              ? 'No entries yet'
              : `${ledger.rows.length} ${
                  ledger.rows.length === 1 ? 'entry' : 'entries'
                } · ${invitesAccepted} joined`}
          </span>
        </div>

        <div className="-mx-2 overflow-x-auto">
          <LedgerTable rows={ledger.rows} isLoading={ledger.isLoading} />
        </div>

        {ledger.hasNextPage && (
          <div className="flex justify-center pt-2">
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
