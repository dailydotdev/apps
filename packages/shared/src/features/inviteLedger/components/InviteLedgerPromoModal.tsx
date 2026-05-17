import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalClose } from '../../../components/modals/common/ModalClose';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import AlertContext from '../../../contexts/AlertContext';
import AuthContext from '../../../contexts/AuthContext';
import {
  markInviteLedgerPromoSeen,
  setInviteLedgerPromoDismissed,
} from '../debug';
import { useInviteLedger } from '../useInviteLedger';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from '../types';
import {
  getCurrentInviteTier,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';
import { SectionRule } from './parts/SectionRule';
import { Ladder } from './parts/Ladder';
import { InviteLinkFiling } from './parts/InviteLinkFiling';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

/**
 * The Dispatch.
 *
 * A short edition of the Field Report. Same identity, smaller print run.
 * Dateline, lead, link, mini-ladder, single CTA. No noise.
 */
function InviteLedgerPromoModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { updateLastReferralReminder } = useContext(AlertContext);
  const { logEvent } = useLogContext();
  const ledger = useInviteLedger();
  const isLogged = useRef(false);

  const { invitesAccepted } = ledger;
  const current = getCurrentInviteTier(invitesAccepted);
  const next = getNextInviteMilestone(invitesAccepted);
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);

  useEffect(() => {
    if (isLogged.current) {
      return;
    }
    isLogged.current = true;
    markInviteLedgerPromoSeen();
    updateLastReferralReminder?.();
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({
        surface: 'dispatch',
        invites: invitesAccepted,
        tier: current?.step ?? 0,
      }),
    });
  }, [logEvent, updateLastReferralReminder, invitesAccepted, current]);

  const handleOpenLedger = (event?: React.MouseEvent) => {
    logEvent({
      event_name: LogEvent.InviteLedgerStripClick,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: 'dispatch', cta: 'open_ledger' }),
    });
    router.push('/settings/referrals');
    onRequestClose?.(event ?? (null as unknown as React.MouseEvent));
  };

  const handleDismissForever = (event?: React.MouseEvent) => {
    setInviteLedgerPromoDismissed(true);
    logEvent({
      event_name: LogEvent.InviteLedgerStripDismiss,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: 'dispatch', forever: true }),
    });
    onRequestClose?.(event ?? (null as unknown as React.MouseEvent));
  };

  const firstName = user?.name?.split(/\s+/)[0] ?? user?.username ?? null;
  const greeting = firstName ? `${firstName}, ` : '';
  const nextReward = next?.rewards.map((r) => r.label).join(' and ');

  let statusLine: string | null = null;
  if (invitesAccepted > 0 && next) {
    const remaining =
      invitesAway === 1 ? 'One more bring-in' : `${invitesAway} more bring-ins`;
    statusLine = `${greeting}you're at ${
      current?.title ?? 'the start'
    }. ${remaining} to ${next.title} — ${nextReward}.`;
  } else if (invitesAccepted === 0) {
    statusLine = `${greeting}your filing is open. First bring-in pays 200 Cores and unlocks 100 more on the house.`;
  }

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="!border-border-subtlest-secondary"
    >
      <ModalClose
        onClick={onRequestClose}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        top="2"
        right="2"
      />

      <header className="flex flex-col gap-3 px-5 pb-3 pt-5">
        <div className="flex items-center gap-2 font-mono uppercase tracking-[0.18em] text-text-tertiary typo-caption2">
          <span className="font-semibold text-text-secondary">Dispatch</span>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <span>Invite ledger</span>
        </div>

        <h1 className="font-bold text-text-primary typo-title3">
          Send the link. We pay {INVITE_LEDGER_CORES_PER_INVITE} Cores per
          developer who signs up.
        </h1>
        <p className="text-text-secondary typo-footnote">
          They get a week of Plus on the house —{' '}
          {INVITE_LEDGER_PLUS_DAYS_PER_INVITE} days, no card asked. Six reward
          tiers stack on top.
        </p>

        {statusLine && (
          <p className="text-text-primary typo-footnote">{statusLine}</p>
        )}
      </header>

      <div className="flex flex-col gap-3 border-t border-border-subtlest-secondary px-5 py-4">
        <SectionRule label="Your filing" meta="paste anywhere" />
        <InviteLinkFiling link={ledger.inviteUrl} origin="modal" />
      </div>

      <div className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto border-t border-border-subtlest-secondary px-5 pb-3 pt-3">
        <SectionRule label="The ladder" meta="six tiers" />
        <Ladder invitesAccepted={invitesAccepted} variant="modal" />
      </div>

      <footer className="flex flex-col gap-1.5 border-t border-border-subtlest-secondary px-5 pb-4 pt-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="w-full"
          iconPosition={ButtonIconPosition.Right}
          icon={<ArrowIcon size={IconSize.Size16} className="rotate-90" />}
          onClick={handleOpenLedger}
        >
          Open the ledger
        </Button>
        <button
          type="button"
          className="self-center font-mono uppercase tracking-[0.14em] text-text-tertiary typo-caption2 hover:text-text-primary"
          onClick={handleDismissForever}
        >
          Not now
        </button>
      </footer>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
