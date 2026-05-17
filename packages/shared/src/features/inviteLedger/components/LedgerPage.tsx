import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { InviteLinkInput } from '../../../components/referral';
import { useInviteLedger } from '../useInviteLedger';
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

export const LedgerPage = (): ReactElement => {
  const ledger = useInviteLedger();
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.InviteLedgerViewed,
      target_type: TargetType.InviteLedgerPage,
    });
  }, [logEvent]);

  return (
    <div className="flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-6 tablet:p-7">
      <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-5 tablet:flex-row tablet:items-end tablet:justify-between">
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
            color={TypographyColor.Tertiary}
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

      <footer className="border-t border-border-subtlest-tertiary pt-4 font-mono text-[11px] uppercase tracking-[0.06em] text-text-quaternary">
        Showing {ledger.rows.length} of {ledger.invitesAccepted} \u00b7 sorted
        by most recent
      </footer>
    </div>
  );
};
