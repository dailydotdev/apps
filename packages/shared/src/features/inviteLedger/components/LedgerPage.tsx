import type { ReactElement } from 'react';
import React, { useContext, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import AuthContext from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { getInviteLedgerDemoMode, setInviteLedgerDemoMode } from '../debug';
import type { InviteLedgerDemoMode } from '../debug';
import { useInviteLedger } from '../useInviteLedger';
import {
  getCurrentInviteTier,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from '../types';
import { SectionRule } from './parts/SectionRule';
import { InviteLinkFiling } from './parts/InviteLinkFiling';
import { Ladder } from './parts/Ladder';
import { Season } from './parts/Season';

const DEMO_MODES: InviteLedgerDemoMode[] = ['full', 'single', 'empty', null];
const DEMO_LABEL: Record<string, string> = {
  full: 'full',
  single: 'single',
  empty: 'empty',
  real: 'real',
};

const formatRewards = (
  rewards: { label: string }[] | undefined,
): string | null => {
  if (!rewards?.length) {
    return null;
  }
  return rewards.map((r) => r.label).join(' and ');
};

const DemoSwitcher = ({
  active,
}: {
  active: InviteLedgerDemoMode;
}): ReactElement => (
  <div className="flex items-center gap-2 self-start rounded-8 border border-border-subtlest-secondary bg-surface-float px-2 py-1 font-mono uppercase tracking-[0.14em] text-text-tertiary typo-caption2">
    <span>demo</span>
    <span aria-hidden className="text-text-quaternary">
      ·
    </span>
    {DEMO_MODES.map((mode) => {
      const label = DEMO_LABEL[mode ?? 'real'];
      const isActive = mode === active;
      return (
        <button
          key={label}
          type="button"
          onClick={() => {
            setInviteLedgerDemoMode(mode);
            window.location.reload();
          }}
          className={classNames(
            'rounded-6 px-1.5',
            isActive
              ? 'bg-surface-primary text-text-primary'
              : 'hover:text-text-primary',
          )}
        >
          {label}
        </button>
      );
    })}
  </div>
);

const Dateline = ({
  invitesAccepted,
  tierTitle,
}: {
  invitesAccepted: number;
  tierTitle: string | null;
}): ReactElement => {
  const today = format(new Date(), 'MMM d').toUpperCase();
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono uppercase tracking-[0.18em] text-text-tertiary typo-caption2">
      <span className="font-semibold text-text-secondary">Invite ledger</span>
      <span aria-hidden className="text-text-quaternary">
        ·
      </span>
      <span>{today}</span>
      <span aria-hidden className="text-text-quaternary">
        ·
      </span>
      <span className="tabular-nums">
        {invitesAccepted} <span className="text-text-quaternary">in</span>
      </span>
      {tierTitle && (
        <>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <span className="normal-case tracking-normal text-text-primary">
            {tierTitle}
          </span>
        </>
      )}
    </div>
  );
};

/**
 * The Field Report.
 *
 * A single editorial article about the user's referral activity. Reads
 * top-to-bottom: dateline → lead → invite link → status paragraph →
 * ladder → this season → editorial footnote.
 *
 * No section cards, no grid of stats, no big buttons. One column, one
 * voice, dense typography.
 */
export const LedgerPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const demoMode = getInviteLedgerDemoMode();

  const { invitesAccepted } = ledger;
  const current = getCurrentInviteTier(invitesAccepted);
  const next = getNextInviteMilestone(invitesAccepted);
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.InviteLedgerViewed,
      target_type: TargetType.InviteLedgerPage,
    });
  }, [logEvent]);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (name) {
      return name.split(/\s+/)[0];
    }
    return user?.username ?? null;
  }, [user]);

  const greeting = firstName ? `${firstName}, ` : '';
  const nextReward = formatRewards(next?.rewards);

  let statusLine: string;
  if (invitesAccepted === 0) {
    statusLine = `${greeting}your filing is open and nobody has joined yet. The first developer who signs up earns you 100 Cores on top of the 200 per-invite rate — your way in.`;
  } else if (!next) {
    statusLine = `${greeting}fifty bring-ins. You're in the top 0.1%. Every additional signup still pays out 200 Cores, every time.`;
  } else {
    const verb = invitesAccepted === 1 ? 'developer has' : 'developers have';
    const cores = ledger.coresEarned.toLocaleString('en-US');
    const plusDays = ledger.plusDaysGiftedToFriends.toLocaleString('en-US');
    const remaining =
      invitesAway === 1 ? 'One more bring-in' : `${invitesAway} more bring-ins`;
    statusLine = `${greeting}${invitesAccepted} ${verb} signed up through your link. That's ${cores} Cores in, ${plusDays} days of Plus gifted out, and a clear shot at ${
      next.title
    } — ${remaining.toLowerCase()} for ${nextReward}.`;
  }

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      {demoMode && <DemoSwitcher active={demoMode} />}

      <header className="flex flex-col gap-4">
        <Dateline
          invitesAccepted={invitesAccepted}
          tierTitle={current?.title ?? null}
        />
        <h1 className="font-bold text-text-primary typo-title2">
          Send the link. We pay {INVITE_LEDGER_CORES_PER_INVITE} Cores per
          developer who signs up.
        </h1>
        <p className="text-text-secondary typo-body">
          They get a week of Plus on the house —{' '}
          {INVITE_LEDGER_PLUS_DAYS_PER_INVITE} days, no card asked. Six reward
          tiers stack on top as more land, ending in a custom invite page if you
          cross fifty.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <SectionRule label="Your filing" meta="paste anywhere" />
        <InviteLinkFiling link={ledger.inviteUrl} origin="page" />
      </section>

      <section className="flex flex-col gap-3">
        <SectionRule label="Status" meta={`${invitesAccepted}/50 lifetime`} />
        <p className="text-text-primary typo-body">{statusLine}</p>
      </section>

      <section className="flex flex-col gap-2">
        <SectionRule label="The ladder" meta="six tiers" />
        <Ladder invitesAccepted={invitesAccepted} />
      </section>

      <section className="flex flex-col gap-2">
        <SectionRule
          label="This season"
          meta={
            ledger.rows.length === 0
              ? 'no entries'
              : `${ledger.rows.length} ${
                  ledger.rows.length === 1 ? 'entry' : 'entries'
                }`
          }
        />
        <Season rows={ledger.rows} isLoading={ledger.isLoading} />
        {ledger.hasNextPage && (
          <div className="pt-2">
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              loading={ledger.isFetchingNextPage}
              onClick={() => ledger.fetchNextPage()}
            >
              Load earlier filings
            </Button>
          </div>
        )}
      </section>

      <footer className="border-t border-border-subtlest-secondary pt-3 font-mono text-text-tertiary typo-caption2">
        <p>
          <span className="uppercase tracking-[0.18em]">
            Filed from daily.dev
          </span>
          <span aria-hidden className="mx-2 text-text-quaternary">
            ·
          </span>
          The math holds: {INVITE_LEDGER_CORES_PER_INVITE} Cores per join, six
          tiers, no expiry.
        </p>
      </footer>
    </article>
  );
};
