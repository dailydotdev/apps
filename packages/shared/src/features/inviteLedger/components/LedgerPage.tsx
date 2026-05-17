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
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

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
    <div className="flex flex-col gap-6">
      {demoMode && (
        <div className="border-action-bookmark-default/40 flex flex-wrap items-center gap-2 rounded-12 border bg-action-bookmark-float px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-action-bookmark-default">
          <span>Demo data: {demoMode}</span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            {DEMO_MODES.filter((m) => m !== demoMode).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setInviteLedgerDemoMode(mode);
                  window.location.reload();
                }}
                className="rounded border-action-bookmark-default/40 hover:bg-action-bookmark-default/10 border px-2 py-0.5"
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
              className="rounded border-action-bookmark-default/40 hover:bg-action-bookmark-default/10 border px-2 py-0.5"
            >
              use real data
            </button>
          </span>
        </div>
      )}
      <header className="flex flex-col gap-4 border-b border-border-subtlest-secondary pb-5 tablet:flex-row tablet:items-end tablet:justify-between">
        <div>
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
            className="tracking-[-0.014em]"
          >
            Your invite ledger
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="mt-1 font-mono"
          >
            A record of the developers you brought in.
          </Typography>
        </div>
        <LedgerCounters
          invitesAccepted={ledger.invitesAccepted}
          coresGiftedToFriends={ledger.coresGiftedToFriends}
          plusDaysGiftedToFriends={ledger.plusDaysGiftedToFriends}
        />
      </header>

      <div className="flex flex-col gap-3">
        <InviteLinkInput
          link={ledger.inviteUrl}
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.InviteLedgerPage,
          }}
        />
        <ChannelChips link={ledger.inviteUrl} />
      </div>

      <div className="-mx-2 overflow-x-auto">
        <LedgerTable rows={ledger.rows} isLoading={ledger.isLoading} />
      </div>

      {ledger.hasNextPage && (
        <div className="flex justify-center">
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

      <footer className="border-t border-border-subtlest-secondary pt-4 font-mono text-[11px] uppercase tracking-[0.06em] text-text-tertiary">
        Showing {ledger.rows.length} of {ledger.invitesAccepted} \u00b7 sorted
        by most recent
      </footer>
    </div>
  );
};
