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
  AddUserIcon,
  CoinIcon,
  DevPlusIcon,
  LinkIcon,
  SparkleIcon,
  UserShareIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

const DEMO_MODES = ['full', 'single', 'empty'] as const;

const getHeroHeadline = (invitesAccepted: number): string => {
  if (invitesAccepted === 0) {
    return 'No one has joined through you yet.';
  }
  if (invitesAccepted === 1) {
    return 'One developer joined through your link.';
  }
  return `${invitesAccepted} developers joined through your link.`;
};

const SectionLabel = ({
  icon,
  children,
  meta,
}: {
  icon: ReactElement;
  children: React.ReactNode;
  meta?: React.ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2 text-text-tertiary">
    <span className="text-text-secondary">{icon}</span>
    <span className="font-mono uppercase tracking-[0.14em] text-text-secondary typo-caption2">
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
  unit,
  faded,
}: {
  icon: ReactElement;
  label: string;
  value: number;
  unit?: string;
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
    <span className="flex items-baseline gap-1">
      <span
        className={classNames(
          'font-bold tabular-nums typo-title3',
          faded ? 'text-text-tertiary' : 'text-text-primary',
        )}
      >
        {value.toLocaleString('en-US')}
      </span>
      {unit && <span className="text-text-tertiary typo-caption1">{unit}</span>}
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

  return (
    <div className="flex flex-col gap-5">
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

      {/* HERO — fact only, no subhead */}
      <section className="flex flex-col gap-3">
        <SectionLabel
          icon={<SparkleIcon size={IconSize.XXSmall} />}
          meta={
            current ? (
              <>
                <span className="text-text-primary">{current.title}</span>
                <span aria-hidden className="ml-1 text-text-quaternary">
                  ·
                </span>{' '}
                <span>{unlockedCount}/6</span>
              </>
            ) : (
              '0/6'
            )
          }
        >
          Invite ledger
        </SectionLabel>

        <h2 className="font-bold text-text-primary typo-title2">
          {getHeroHeadline(invitesAccepted)}
        </h2>

        {next && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 typo-caption1">
              <span className="truncate text-text-tertiary">
                Next:{' '}
                <span className="font-semibold text-text-primary">
                  {next.title}
                </span>
                <span className="ml-1 text-text-tertiary">
                  · {invitesAway === 1 ? '1 to go' : `${invitesAway} to go`}
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
            unit={ledger.plusDaysGiftedToFriends === 1 ? 'day' : undefined}
            faded={ledger.plusDaysGiftedToFriends === 0}
          />
        </div>
      </section>

      {/* INVITE LINK */}
      <section className="flex flex-col gap-2">
        <SectionLabel
          icon={<LinkIcon size={IconSize.XXSmall} />}
          meta="One per account"
        >
          Invite link
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
          Bring-ins
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
            >
              Load more
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
