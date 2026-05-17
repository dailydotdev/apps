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
import {
  AddUserIcon,
  CoinIcon,
  DevPlusIcon,
  ReputationLightningIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import AlertContext from '../../../contexts/AlertContext';
import {
  markInviteLedgerPromoSeen,
  setInviteLedgerPromoDismissed,
} from '../debug';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from '../types';
import { useInviteLedger } from '../useInviteLedger';

interface RewardBulletProps {
  icon: ReactElement;
  label: string;
  detail: string;
  tone: 'cabbage' | 'cheese' | 'avocado';
}

const toneClasses: Record<RewardBulletProps['tone'], string> = {
  cabbage:
    'bg-accent-cabbage-subtlest text-accent-cabbage-default ring-accent-cabbage-default/20',
  cheese:
    'bg-accent-cheese-subtlest text-accent-cheese-default ring-accent-cheese-default/20',
  avocado:
    'bg-accent-avocado-subtlest text-accent-avocado-default ring-accent-avocado-default/20',
};

const RewardBullet = ({
  icon,
  label,
  detail,
  tone,
}: RewardBulletProps): ReactElement => (
  <li className="flex items-start gap-3">
    <span
      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-12 ring-1 ${toneClasses[tone]}`}
    >
      {icon}
    </span>
    <div className="flex flex-col">
      <span className="font-semibold text-text-primary typo-callout">
        {label}
      </span>
      <span className="text-text-tertiary typo-footnote">{detail}</span>
    </div>
  </li>
);

function InviteLedgerPromoModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const router = useRouter();
  const { updateLastReferralReminder } = useContext(AlertContext);
  const { logEvent } = useLogContext();
  const ledger = useInviteLedger();
  const isLogged = useRef(false);

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
      extra: JSON.stringify({ surface: 'promo_modal' }),
    });
  }, [logEvent, updateLastReferralReminder]);

  const handleOpenLedger = (event?: React.MouseEvent) => {
    logEvent({
      event_name: LogEvent.InviteLedgerStripClick,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: 'promo_modal' }),
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

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      overlayClassName="modal-backdrop-rays"
      className="z-50 tablet:ring-white/10 isolate overflow-hidden !border-border-subtlest-primary tablet:!border-2 tablet:!shadow-[0_40px_80px_-10px_rgba(0,0,0,0.85),0_15px_40px_-10px_rgba(0,0,0,0.6)] tablet:ring-1 tablet:ring-inset"
    >
      <div
        aria-hidden
        className="bg-accent-cabbage-default/25 pointer-events-none absolute -left-24 -top-24 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent-onion-default/20 pointer-events-none absolute -right-20 -top-10 size-56 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent-cheese-default/10 pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full blur-3xl"
      />

      <ModalClose
        onClick={onRequestClose}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        top="2"
        right="2"
      />

      <div className="relative flex flex-col items-center gap-6 px-6 pb-6 pt-10 text-center">
        <span className="relative flex size-16 items-center justify-center rounded-16 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-white shadow-[0_8px_24px_-4px_rgba(206,134,253,0.5)]">
          <AddUserIcon size={IconSize.XLarge} secondary />
          <span
            aria-hidden
            className="-z-10 bg-accent-cabbage-default/40 absolute -inset-1 rounded-18 blur-xl"
          />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="bg-gradient-to-br from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text font-bold text-transparent typo-large-title">
            Bring developers in.
            <br />
            Earn as they read.
          </h1>
          <p className="mx-auto max-w-sm text-text-secondary typo-callout">
            Every friend who joins through your link earns you Cores, gives them
            Plus days, and adds a permanent line to your invite ledger.
          </p>
        </div>

        <ul className="bg-surface-float/60 flex w-full flex-col gap-3 rounded-14 border border-border-subtlest-secondary px-4 py-4 text-left">
          <RewardBullet
            tone="cabbage"
            icon={<CoinIcon size={IconSize.Small} secondary />}
            label={`+${INVITE_LEDGER_CORES_PER_INVITE} Cores per friend`}
            detail="Credited the moment they accept your invite."
          />
          <RewardBullet
            tone="avocado"
            icon={<DevPlusIcon size={IconSize.Small} />}
            label={`${INVITE_LEDGER_PLUS_DAYS_PER_INVITE} Plus days for them`}
            detail="They start with the premium experience on day one."
          />
          <RewardBullet
            tone="cheese"
            icon={<ReputationLightningIcon size={IconSize.Small} secondary />}
            label="A line in your public ledger"
            detail="A real, lasting record of the devs you brought in."
          />
        </ul>

        {ledger.invitesAccepted > 0 && (
          <div className="text-text-tertiary typo-footnote">
            You&apos;ve already brought in{' '}
            <strong className="tabular-nums text-text-primary">
              {ledger.invitesAccepted}
            </strong>{' '}
            {ledger.invitesAccepted === 1 ? 'developer' : 'developers'}. Keep
            going.
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default hover:shadow-2-cabbage"
            onClick={handleOpenLedger}
          >
            Open your invite ledger
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            className="w-full"
            onClick={handleDismissForever}
          >
            Don&apos;t show this again
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default InviteLedgerPromoModal;
