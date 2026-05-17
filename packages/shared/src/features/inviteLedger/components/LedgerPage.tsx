import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { InviteLinkInput } from '../../../components/referral';
import { useInviteLedger } from '../useInviteLedger';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from '../types';
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
  AddUserIcon,
  ArrowIcon,
  CoinIcon,
  DevPlusIcon,
  LinkIcon,
  SparkleIcon,
  UserShareIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

const DEMO_MODES = ['full', 'single', 'empty'] as const;

const SectionLabel = ({
  icon,
  children,
  meta,
}: {
  icon: ReactElement;
  children: React.ReactNode;
  meta?: React.ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2 leading-none">
    <span className="text-text-secondary">{icon}</span>
    <span className="font-mono font-semibold uppercase tracking-[0.14em] text-text-secondary typo-caption2">
      {children}
    </span>
    {meta && (
      <>
        <span aria-hidden className="text-text-quaternary">
          ·
        </span>
        <span className="text-text-tertiary typo-caption1">{meta}</span>
      </>
    )}
  </div>
);

const StatCell = ({
  icon,
  label,
  value,
  faded,
}: {
  icon: ReactElement;
  label: string;
  value: number;
  faded?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span
      className={classNames(
        'flex items-center gap-1 font-mono uppercase tracking-[0.12em] typo-caption2',
        faded ? 'text-text-quaternary' : 'text-text-tertiary',
      )}
    >
      <span aria-hidden className={faded ? '' : 'text-text-secondary'}>
        {icon}
      </span>
      {label}
    </span>
    <span
      className={classNames(
        'font-bold tabular-nums typo-title3',
        faded ? 'text-text-tertiary' : 'text-text-primary',
      )}
    >
      {value.toLocaleString('en-US')}
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
  const unlockedCount = current?.step ?? 0;

  useEffect(() => {
    logEvent({
      event_name: LogEvent.InviteLedgerViewed,
      target_type: TargetType.InviteLedgerPage,
    });
  }, [logEvent]);

  const nextRewardSummary = next?.rewards.map((r) => r.label).join(' + ');

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

      {/* HERO — action + reward math (this is the page identity) */}
      <header className="flex flex-col gap-3">
        <SectionLabel
          icon={<SparkleIcon size={IconSize.XXSmall} />}
          meta={
            current ? (
              <>
                <span className="text-text-primary">{current.title}</span>
                <span aria-hidden className="mx-1 text-text-quaternary">
                  ·
                </span>
                <span>{unlockedCount}/6 unlocked</span>
              </>
            ) : (
              '0/6 unlocked'
            )
          }
        >
          Invite ledger
        </SectionLabel>

        <h2 className="font-bold text-text-primary typo-title2">
          {INVITE_LEDGER_CORES_PER_INVITE} Cores per developer you invite.
        </h2>
        <p className="text-text-secondary typo-callout">
          They get {INVITE_LEDGER_PLUS_DAYS_PER_INVITE} days of Plus on us. You
          climb six reward tiers as more sign up.
        </p>
      </header>

      {/* ACTION — link + share, right under the hero */}
      <section className="flex flex-col gap-2">
        <SectionLabel
          icon={<LinkIcon size={IconSize.XXSmall} />}
          meta="Share to earn"
        >
          Your invite link
        </SectionLabel>
        <InviteLinkInput
          link={ledger.inviteUrl}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteLedgerPage,
          }}
        />
        <ChannelChips link={ledger.inviteUrl} />
      </section>

      {/* PROGRESS — secondary status belt */}
      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 border-y border-border-subtlest-secondary py-3">
          <StatCell
            icon={<AddUserIcon size={IconSize.XXSmall} />}
            label="In"
            value={invitesAccepted}
          />
          <StatCell
            icon={<CoinIcon size={IconSize.XXSmall} secondary />}
            label="Cores"
            value={ledger.coresGiftedToFriends}
            faded={ledger.coresGiftedToFriends === 0}
          />
          <StatCell
            icon={<DevPlusIcon size={IconSize.XXSmall} />}
            label="Plus days"
            value={ledger.plusDaysGiftedToFriends}
            faded={ledger.plusDaysGiftedToFriends === 0}
          />
        </div>

        {next && (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 typo-caption1">
              <span className="text-text-tertiary">
                Next:{' '}
                <span className="font-semibold text-text-primary">
                  {next.title}
                </span>
                <span aria-hidden className="mx-1 text-text-quaternary">
                  ·
                </span>
                <span className="text-text-tertiary">
                  {invitesAway === 1
                    ? '1 more invite unlocks'
                    : `${invitesAway} more invites unlock`}{' '}
                  <span className="font-semibold text-text-primary">
                    {nextRewardSummary}
                  </span>
                </span>
              </span>
              <span className="shrink-0 font-mono font-semibold tabular-nums text-text-tertiary">
                {invitesAccepted}/{next.invites}
              </span>
            </div>
            <div
              className="relative h-1 overflow-hidden rounded-full bg-surface-float"
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
      </section>

      {/* LADDER */}
      <section className="flex flex-col gap-2">
        <SectionLabel
          icon={<SparkleIcon size={IconSize.XXSmall} />}
          meta={`${unlockedCount} of 6 unlocked`}
        >
          The ladder
        </SectionLabel>
        <InviteMilestoneTimeline invitesAccepted={invitesAccepted} />
      </section>

      {/* BRING-INS */}
      <section className="flex flex-col gap-2">
        <SectionLabel
          icon={<UserShareIcon size={IconSize.XXSmall} />}
          meta={
            ledger.rows.length === 0
              ? 'None yet'
              : `${ledger.rows.length} ${
                  ledger.rows.length === 1 ? 'entry' : 'entries'
                }`
          }
        >
          Who joined
        </SectionLabel>

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
              icon={<ArrowIcon size={IconSize.Size16} className="rotate-180" />}
            >
              Load more
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
