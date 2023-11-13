import React, { ReactElement, useEffect, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { cloudinary } from '../../../lib/image';
import CloseButton from '../../CloseButton';
import { ModalSize } from '../common/types';
import { Button, ButtonSize } from '../../buttons/Button';
import { TextField } from '../../fields/TextField';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../../../lib/share';
import WhatsappIcon from '../../icons/Whatsapp';
import { SimpleTooltip } from '../../tooltips';
import FacebookIcon from '../../icons/Facebook';
import TwitterIcon from '../../icons/Twitter';
import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { link } from '../../../lib/links';
import { labels } from '../../../lib';
import { AnalyticsEvent, TargetId, TargetType } from '../../../lib/analytics';
import { ReferralCampaignKey, useReferralCampaign } from '../../../hooks';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';

function GenericReferralModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const [shareState, setShareState] = useState(false);
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const [copyingLink, onShareOrCopyLink] = useShareOrCopyLink({
    text: labels.referral.generic.inviteText,
    link: inviteLink,
    trackObject: () => ({
      event_name: AnalyticsEvent.CopyReferralLink,
      target_id: TargetId.GenericReferralPopup,
    }),
  });
  const { trackEvent } = useAnalyticsContext();
  const onShareClick = () => {
    onShareOrCopyLink();
    setShareState(true);
  };

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.ReferralPopup,
    });

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal {...props} onRequestClose={onRequestClose} size={ModalSize.Small}>
      <CloseButton
        onClick={onRequestClose}
        position="absolute"
        buttonSize={ButtonSize.Small}
        className="top-4 right-4 z-2 !btn-secondary"
      />
      <Modal.Body>
        <div className="flex relative z-1 flex-col justify-end items-center mb-5 w-full aspect-square">
          <h1 className="mb-4 font-bold typo-mega3">Invite friends</h1>
          <p className="typo-title3 text-theme-label-secondary">
            And make Ido (our CTO) smile again.
          </p>
        </div>
        <img
          src={
            cloudinary.referralCampaign.generic[!shareState ? 'sad' : 'happy']
          }
          alt={!shareState ? 'CTO Ido looking sad' : 'CTO Ido looking happy'}
          className="object-cover absolute top-0 left-0 z-0 w-full aspect-square"
        />
        <TextField
          name="inviteURL"
          inputId="inviteURL"
          label="Your unique invite URL"
          type="url"
          autoComplete="off"
          value={inviteLink}
          fieldType="tertiary"
          actionButton={
            <Button
              buttonSize={ButtonSize.Small}
              className="btn-primary"
              onClick={onShareClick}
            >
              Copy link {!copyingLink ? '😀' : '😉'}
            </Button>
          }
          readOnly
        />
        <div className="flex gap-3 justify-center items-center mt-7">
          <p className="mr-1 typo-callout text-theme-label-tertiary">
            Invite with
          </p>
          <SimpleTooltip content="Share on WhatsApp">
            <Button
              tag="a"
              href={getWhatsappShareLink(inviteLink)}
              target="_blank"
              rel="noopener"
              icon={<WhatsappIcon />}
              className="btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
          <SimpleTooltip content="Share on Facebook">
            <Button
              tag="a"
              href={getFacebookShareLink(inviteLink)}
              target="_blank"
              rel="noopener"
              icon={<FacebookIcon />}
              className="btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
          <SimpleTooltip content="Share on X">
            <Button
              tag="a"
              href={getTwitterShareLink(
                inviteLink,
                labels.referral.generic.inviteText,
              )}
              target="_blank"
              rel="noopener"
              icon={<TwitterIcon />}
              className="btn-tertiary"
              iconOnly
            />
          </SimpleTooltip>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default GenericReferralModal;
