import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalClose } from '../../../components/modals/common/ModalClose';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon, SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
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
import { InviteMilestoneTimeline } from './InviteMilestoneTimeline';
import type { InviteMilestone } from '../milestones';

interface ModalCopyContext {
  isBrandNew: boolean;
  current: InviteMilestone | null;
  next: InviteMilestone | null;
}

const getModalHeadline = ({
  isBrandNew,
  current,
  next,
}: ModalCopyContext): string => {
  if (isBrandNew) {
    return 'Start your invite journey';
  }
  if (current && !next) {
    return 'You hit the top tier';
  }
  return `You unlocked ${current?.label ?? 'your first reward'}`;
};

const getModalSubhead = ({
  isBrandNew,
  next,
  invitesAway,
}: {
  isBrandNew: boolean;
  next: InviteMilestone | null;
  invitesAway: number;
}): string => {
  if (isBrandNew) {
    return 'Each developer you bring in unlocks the next reward. Bigger every step.';
  }
  if (!next) {
    return 'Every future invite still earns you Cores in your ledger.';
  }
  const awayLabel = invitesAway === 1 ? '1 invite' : `${invitesAway} invites`;
  return `${awayLabel} away from ${next.label}.`;
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
        tier: current?.tier ?? 'none',
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

  const headline = getModalHeadline({ isBrandNew, current, next });
  const subhead = getModalSubhead({
    isBrandNew,
    next,
    invitesAway,
  });

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      className="z-50 isolate overflow-hidden !border-border-subtlest-secondary tablet:!border-2 tablet:!shadow-[0_40px_80px_-10px_rgba(0,0,0,0.4)]"
    >
      <div
        aria-hidden
        className="-z-10 bg-accent-cabbage-default/20 pointer-events-none absolute -left-32 -top-32 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="-z-10 bg-accent-onion-default/20 pointer-events-none absolute -right-32 -top-20 size-64 rounded-full blur-3xl"
      />

      <ModalClose
        onClick={onRequestClose}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        top="2"
        right="2"
      />

      <div className="flex flex-col">
        {/* Hero */}
        <header className="relative flex flex-col gap-4 px-6 pb-5 pt-9">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-float px-2.5 py-1 text-text-secondary typo-caption1">
              <SendAirplaneIcon
                size={IconSize.Size16}
                className="text-accent-cabbage-default"
                secondary
              />
              Invite ledger
            </span>
            {current && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-cabbage-subtlest px-2.5 py-1 font-semibold text-accent-cabbage-bolder typo-caption1">
                {current.label}
              </span>
            )}
          </div>

          <h1 className="font-bold text-text-primary typo-title2">
            {headline}
          </h1>
          <p className="max-w-prose text-text-secondary typo-callout">
            {subhead}
          </p>

          {/* Progress to next tier */}
          {next && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-text-tertiary typo-caption1">
                <span>
                  {current?.label ?? 'Start'} → {next.label}
                </span>
                <span className="font-semibold tabular-nums text-text-primary">
                  {invitesAccepted}/{next.invites}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-surface-float">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Milestones list */}
        <div className="bg-surface-float/40 flex max-h-[42vh] flex-col overflow-y-auto border-t border-border-subtlest-secondary px-6 pt-5">
          <div className="flex items-center justify-between pb-3">
            <span className="font-bold text-text-primary typo-callout">
              The reward path
            </span>
            <span className="text-text-tertiary typo-caption1">
              {
                INVITE_MILESTONES.filter((m) => invitesAccepted >= m.invites)
                  .length
              }{' '}
              of {INVITE_MILESTONES.length} unlocked
            </span>
          </div>
          <InviteMilestoneTimeline
            invitesAccepted={invitesAccepted}
            variant="modal"
          />
        </div>

        {/* Footer / CTA */}
        <footer
          className={classNames(
            'flex flex-col gap-2 border-t border-border-subtlest-secondary bg-background-default px-6 py-5',
          )}
        >
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full"
            icon={<ArrowIcon size={IconSize.Size16} className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={handleOpenLedger}
          >
            Get your invite link
          </Button>
          <button
            type="button"
            className="self-center text-text-tertiary typo-footnote hover:text-text-primary"
            onClick={handleDismissForever}
          >
            Don&apos;t show this again
          </button>
        </footer>
      </div>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
