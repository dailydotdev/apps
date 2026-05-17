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
  INVITE_MILESTONES,
  getCurrentInviteTier,
  getInviteTierProgress,
  getInvitesUntilNextTier,
  getNextInviteMilestone,
} from '../milestones';
import { InviteMilestoneTimeline } from './InviteMilestoneTimeline';
import { ArrowIcon, SparkleIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

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

  const nextRewardSummary = next?.rewards.map((r) => r.label).join(' + ');

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

      {/* HEADER — action + reward math */}
      <header className="flex flex-col gap-2.5 px-5 pb-3 pt-5">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <SparkleIcon size={IconSize.XXSmall} />
          <span className="font-mono font-semibold uppercase tracking-[0.14em] typo-caption2">
            Invite ledger
          </span>
          <span aria-hidden className="text-text-quaternary">
            ·
          </span>
          <span className="text-text-tertiary typo-caption2">
            {unlockedCount}/{INVITE_MILESTONES.length} unlocked
          </span>
        </div>

        <h1 className="font-bold text-text-primary typo-title3">
          {INVITE_LEDGER_CORES_PER_INVITE} Cores per developer you invite.
        </h1>
        <p className="text-text-secondary typo-footnote">
          They get {INVITE_LEDGER_PLUS_DAYS_PER_INVITE} days of Plus on us. Six
          reward tiers stack on top as more sign up.
        </p>

        {next && invitesAccepted > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 typo-caption2">
              <span className="truncate text-text-tertiary">
                You&rsquo;re at{' '}
                <span className="font-semibold text-text-primary">
                  {current?.title ?? 'the start'}
                </span>
                .{' '}
                <span className="text-text-tertiary">
                  {invitesAway === 1
                    ? 'One more for'
                    : `${invitesAway} more for`}{' '}
                  <span className="font-semibold text-text-primary">
                    {nextRewardSummary}
                  </span>
                  .
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
      </header>

      {/* LADDER — show the carrot */}
      <div className="flex max-h-[44vh] flex-col overflow-y-auto border-t border-border-subtlest-secondary px-5 pb-3 pt-2">
        <InviteMilestoneTimeline invitesAccepted={invitesAccepted} />
      </div>

      {/* CTAS */}
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
          Get my invite link
        </Button>
        <button
          type="button"
          className="self-center text-text-tertiary typo-caption1 hover:text-text-primary"
          onClick={handleDismissForever}
        >
          Not now
        </button>
      </footer>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
