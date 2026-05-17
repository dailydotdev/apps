import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
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
    return 'You haven\u2019t brought anyone in yet.';
  }
  if (current && !next) {
    return 'You hit the top of the ladder.';
  }
  return `You\u2019re on ${current?.title.toLowerCase() ?? 'the ladder'}.`;
};

const getSubhead = ({
  isBrandNew,
  next,
  invitesAway,
}: ModalCopyContext): string => {
  if (isBrandNew) {
    return 'Six rewards sit on the other side of your invite link. The first one needs one developer to join.';
  }
  if (!next) {
    return 'Every future bring-in keeps adding Cores to your ledger.';
  }
  const awayLabel =
    invitesAway === 1 ? 'One bring-in' : `${invitesAway} bring-ins`;
  return `${awayLabel} to reach ${next.title.toLowerCase()}.`;
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
  const subhead = getSubhead({ isBrandNew, current, next, invitesAway });

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

      {/* Section 1 — header (tight, factual) */}
      <header className="flex flex-col gap-3 border-b border-border-subtlest-secondary px-5 pb-4 pt-6">
        <div className="flex items-center gap-2 text-text-tertiary typo-caption1">
          <span className="font-mono uppercase tracking-[0.12em]">
            Invite ledger
          </span>
          <span aria-hidden>·</span>
          <span>
            {unlockedCount} of {INVITE_MILESTONES.length} unlocked
          </span>
        </div>

        <h1 className="font-bold text-text-primary typo-title3">{headline}</h1>
        <p className="text-text-secondary typo-callout">{subhead}</p>

        {next && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-text-tertiary typo-caption1">
              <span className="truncate">
                Next: <span className="text-text-primary">{next.title}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">
                {invitesAccepted}/{next.invites}
              </span>
            </div>
            <div
              className="relative h-1.5 overflow-hidden rounded-full bg-surface-float"
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

      {/* Section 2 — the path (scrollable list, numbered) */}
      <div
        className={classNames(
          'flex max-h-[44vh] flex-col overflow-y-auto px-5 py-3',
        )}
      >
        <InviteMilestoneTimeline invitesAccepted={invitesAccepted} showBlurb />
      </div>

      {/* Section 3 — CTAs */}
      <footer className="flex flex-col gap-2 border-t border-border-subtlest-secondary px-5 pb-5 pt-4">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="w-full"
          onClick={handleOpenLedger}
        >
          Get my invite link
        </Button>
        <button
          type="button"
          className="self-center text-text-tertiary typo-footnote hover:text-text-primary"
          onClick={handleDismissForever}
        >
          Don&apos;t show this again
        </button>
      </footer>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
