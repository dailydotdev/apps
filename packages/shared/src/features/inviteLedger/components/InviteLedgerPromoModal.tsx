import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalClose } from '../../../components/modals/common/ModalClose';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import AlertContext from '../../../contexts/AlertContext';
import {
  markInviteLedgerPromoSeen,
  setInviteLedgerPromoDismissed,
} from '../debug';
import { useInviteLedger } from '../useInviteLedger';
import {
  INVITE_MILESTONES,
  getCurrentInviteTier,
  getInviteTierProgress,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';
import type { InviteMilestone } from '../milestones';
import { InviteMilestoneTimeline } from './InviteMilestoneTimeline';
import { SparkleIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface ModalCopyContext {
  isBrandNew: boolean;
  current: InviteMilestone | null;
  next: InviteMilestone | null;
  invitesAway: number;
}

const getHeadline = ({
  isBrandNew,
  current,
  next,
}: ModalCopyContext): string => {
  if (isBrandNew) {
    return 'Six rewards. One invite link.';
  }
  if (current && !next) {
    return 'Top of the ladder.';
  }
  return `You\u2019re on ${current?.title.toLowerCase() ?? 'the ladder'}.`;
};

const getSubhead = ({
  isBrandNew,
  next,
  invitesAway,
}: ModalCopyContext): string | null => {
  if (isBrandNew) {
    return 'One developer joining is enough to start.';
  }
  if (!next) {
    return null;
  }
  const awayLabel = invitesAway === 1 ? 'One bring-in' : `${invitesAway} more`;
  return `${awayLabel} to ${next.title.toLowerCase()}.`;
};

function InviteLedgerPromoModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const router = useRouter();
  const { updateLastReferralReminder } = useContext(AlertContext);
  const { logEvent } = useLogContext();
  const ledger = useInviteLedger();
  const isLogged = useRef(false);

  const { invitesAccepted } = ledger;
  const current = getCurrentInviteTier(invitesAccepted);
  const next = getNextInviteMilestone(invitesAccepted);
  const invitesAway = getInvitesUntilNextTier(invitesAccepted);
  const progress = getInviteTierProgress(invitesAccepted);
  const isBrandNew = invitesAccepted === 0;
  const unlockedCount = INVITE_MILESTONES.filter(
    (m) => invitesAccepted >= m.invites,
  ).length;

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
        surface: 'promo_modal',
        invites: invitesAccepted,
        tier: current?.step ?? 0,
      }),
    });
  }, [logEvent, updateLastReferralReminder, invitesAccepted, current]);

  const handleOpenLedger = (event?: React.MouseEvent) => {
    logEvent({
      event_name: LogEvent.InviteLedgerStripClick,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: 'promo_modal', cta: 'open_ledger' }),
    });
    router.push('/settings/referrals');
    onRequestClose?.(event ?? (null as unknown as React.MouseEvent));
  };

  const handleDismissForever = (event?: React.MouseEvent) => {
    setInviteLedgerPromoDismissed(true);
    logEvent({
      event_name: LogEvent.InviteLedgerStripDismiss,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: 'promo_modal', forever: true }),
    });
    onRequestClose?.(event ?? (null as unknown as React.MouseEvent));
  };

  const headline = getHeadline({ isBrandNew, current, next, invitesAway });
  const subhead = getSubhead({ isBrandNew, next, invitesAway, current });

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

      {/* HEADER — caption + headline + tiny progress meta */}
      <header className="flex flex-col gap-2 px-5 pb-3 pt-5">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <SparkleIcon size={IconSize.XXSmall} />
          <span className="font-mono uppercase tracking-[0.14em] typo-caption2">
            Invite ledger
          </span>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <span className="text-text-tertiary typo-caption2">
            {unlockedCount}/{INVITE_MILESTONES.length} unlocked
          </span>
        </div>

        <h1 className="font-bold text-text-primary typo-title3">{headline}</h1>

        {subhead && (
          <p className="text-text-secondary typo-footnote">{subhead}</p>
        )}

        {next && (
          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 font-mono tabular-nums text-text-tertiary typo-caption2">
              <span>{next.title}</span>
              <span>
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
      </header>

      {/* LADDER */}
      <div className="flex max-h-[44vh] flex-col overflow-y-auto border-t border-border-subtlest-secondary px-5 pb-3 pt-2">
        <InviteMilestoneTimeline invitesAccepted={invitesAccepted} />
      </div>

      {/* CTAS */}
      <footer className="flex flex-col gap-1.5 border-t border-border-subtlest-secondary px-5 pb-4 pt-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="w-full"
          onClick={handleOpenLedger}
        >
          Get my invite link
        </Button>
        <button
          type="button"
          className="self-center text-text-tertiary typo-caption1 hover:text-text-primary"
          onClick={handleDismissForever}
        >
          Don&apos;t show this again
        </button>
      </footer>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
