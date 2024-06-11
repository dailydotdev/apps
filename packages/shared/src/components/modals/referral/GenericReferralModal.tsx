import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { cloudinary } from '../../../lib/image';
import { ModalSize } from '../common/types';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { link } from '../../../lib/links';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { ReferralCampaignKey, useReferralCampaign } from '../../../hooks';
import ReferralSocialShareButtons from '../../widgets/ReferralSocialShareButtons';
import { useLogContext } from '../../../contexts/LogContext';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { ModalClose } from '../common/ModalClose';
import AlertContext from '../../../contexts/AlertContext';

function GenericReferralModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { updateLastReferralReminder } = useContext(AlertContext);
  const [shareState, setShareState] = useState(false);
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const { logEvent } = useLogContext();
  const isLogged = useRef(false);

  useEffect(() => {
    if (!isLogged.current) {
      updateLastReferralReminder();
      isLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.ReferralPopup,
      });
    }
  }, [logEvent, updateLastReferralReminder]);

  return (
    <Modal {...props} onRequestClose={onRequestClose} size={ModalSize.Small}>
      <ModalClose
        onClick={onRequestClose}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        top="4"
        right="4"
        zIndex="2"
      />
      <Modal.Body>
        <div className="relative z-1 mb-5 flex aspect-square w-full flex-col items-center justify-end">
          <h1 className="mb-4 font-bold typo-mega3">Invite friends</h1>
          <p className="text-text-secondary typo-title3">
            And make Ido (our CTO) smile again.
          </p>
        </div>
        <img
          src={
            cloudinary.referralCampaign.generic[!shareState ? 'sad' : 'happy']
          }
          alt={!shareState ? 'CTO Ido looking sad' : 'CTO Ido looking happy'}
          className="absolute left-0 top-0 z-0 aspect-square w-full object-cover"
        />
        <InviteLinkInput
          logProps={{
            event_name: LogEvent.CopyReferralLink,
            target_id: TargetId.GenericReferralPopup,
          }}
          link={inviteLink}
          onCopy={() => setShareState(true)}
          text={{ initial: 'Copy link 😀', copied: 'Copied 😉' }}
        />
        <div className="mt-7 flex items-center justify-center gap-3">
          <p className="mr-1 text-text-tertiary typo-callout">Invite via</p>
          <ReferralSocialShareButtons
            url={url}
            targetType={TargetType.GenericReferralPopup}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default GenericReferralModal;
