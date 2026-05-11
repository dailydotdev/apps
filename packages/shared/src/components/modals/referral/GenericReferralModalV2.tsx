import type { ReactElement } from 'react';
import React, { useContext, useEffect, useRef } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { AddUserIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { link } from '../../../lib/links';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { ReferralCampaignKey, useReferralCampaign } from '../../../hooks';
import ReferralSocialShareButtons from '../../widgets/ReferralSocialShareButtons';
import { useLogContext } from '../../../contexts/LogContext';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { ModalClose } from '../common/ModalClose';
import AlertContext from '../../../contexts/AlertContext';
import type { ReferralCelebrationParticlesHandle } from './ReferralCelebrationParticles';
import { ReferralCelebrationParticles } from './ReferralCelebrationParticles';

function GenericReferralModalV2({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { updateLastReferralReminder } = useContext(AlertContext);
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const { logEvent } = useLogContext();
  const isLogged = useRef(false);
  const particlesRef = useRef<ReferralCelebrationParticlesHandle>(null);

  const celebrateFromClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('button, a')) {
      return;
    }
    particlesRef.current?.celebrate();
  };

  useEffect(() => {
    if (isLogged.current) {
      return;
    }
    updateLastReferralReminder?.();
    isLogged.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.ReferralPopup,
    });
  }, [logEvent, updateLastReferralReminder]);

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      overlayClassName="modal-backdrop-rays"
      className="z-50 tablet:ring-white/10 isolate !border-border-subtlest-primary tablet:!border-2 tablet:!shadow-[0_40px_80px_-10px_rgba(0,0,0,0.85),0_15px_40px_-10px_rgba(0,0,0,0.6)] tablet:ring-1 tablet:ring-inset"
    >
      <ReferralCelebrationParticles ref={particlesRef} />
      <ModalClose
        onClick={onRequestClose}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        top="2"
        right="2"
      />
      <div className="flex flex-col items-center gap-6 px-6 pb-6 pt-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-16 bg-theme-overlay-float-cabbage text-brand-default">
          <AddUserIcon size={IconSize.XLarge} secondary />
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-text-primary typo-large-title">
            Bring your friends
          </h1>
          <p className="text-text-secondary typo-callout">
            Share your link before they discover it on their own and steal your
            credibility.
          </p>
        </div>

        <div className="w-full" onClickCapture={celebrateFromClick}>
          <InviteLinkInput
            className={{ container: 'w-full' }}
            logProps={{
              event_name: LogEvent.CopyReferralLink,
              target_id: TargetId.GenericReferralPopup,
            }}
            link={inviteLink}
            text={{ initial: 'Copy link', copied: 'Copied' }}
          />
        </div>

        <div className="flex w-full items-center gap-3">
          <span className="text-text-tertiary typo-callout">Or invite via</span>
          <span
            className="ml-auto flex items-center gap-2"
            onClickCapture={celebrateFromClick}
          >
            <ReferralSocialShareButtons
              url={url}
              targetType={TargetType.GenericReferralPopup}
            />
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default GenericReferralModalV2;
