import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { InviteLinkInput } from '../../../components/referral';
import { useInviteLedger } from '../useInviteLedger';
import { getInviteLedgerDemoMode, setInviteLedgerDemoMode } from '../debug';
import { LedgerCounters } from './LedgerCounters';
import { LedgerTable } from './LedgerTable';
import { ChannelChips } from './ChannelChips';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

const DEMO_MODES = ['full', 'single', 'empty'] as const;

export const LedgerPage = (): ReactElement => {
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();
  const demoMode = getInviteLedgerDemoMode();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.InviteLedgerViewed,
      target_type: TargetType.InviteLedgerPage,
    });
  }, [logEvent]);

  return (
    <div className="relative flex flex-col gap-8">
      <div
        aria-hidden
        className="-z-10 bg-accent-cabbage-default/15 pointer-events-none absolute -left-40 -top-32 size-80 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="-z-10 bg-accent-onion-default/10 pointer-events-none absolute -right-32 top-20 size-72 rounded-full blur-3xl"
      />

      {demoMode && (
        <div className="border-accent-cabbage-default/30 flex flex-wrap items-center gap-2 rounded-12 border bg-accent-cabbage-subtlest px-3 py-2 text-accent-cabbage-bolder typo-caption1">
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

      <header className="flex flex-col gap-5">
        <p className="max-w-2xl text-text-secondary typo-body">
          Every developer you bring in earns you{' '}
          <strong className="text-accent-cheese-bolder">Cores</strong>, gives
          them <strong className="text-accent-avocado-bolder">Plus days</strong>
          , and leaves a permanent line in your ledger.
        </p>
        <LedgerCounters
          invitesAccepted={ledger.invitesAccepted}
          coresGiftedToFriends={ledger.coresGiftedToFriends}
          plusDaysGiftedToFriends={ledger.plusDaysGiftedToFriends}
        />
      </header>

      <section className="bg-surface-float/60 relative flex flex-col gap-3 rounded-16 border border-border-subtlest-secondary p-5">
        <div
          aria-hidden
          className="via-accent-cabbage-default/40 pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent to-transparent"
        />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-primary typo-callout">
            Your invite link
          </span>
          <span className="text-text-tertiary typo-footnote">
            Send it to a friend. They join, you both win.
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

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-text-primary typo-title3">
            The ledger
          </h2>
          <span className="text-text-tertiary typo-footnote">
            {ledger.rows.length === 0
              ? 'No entries yet'
              : `${ledger.rows.length} ${
                  ledger.rows.length === 1 ? 'entry' : 'entries'
                } · ${ledger.invitesAccepted} joined`}
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
