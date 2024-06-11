import React, { ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';
import { CardCover } from '../cards/common/CardCover';
import type { MarketingCta } from '../cards/MarketingCta/common';
import {
  CTAButton,
  Description,
  Header,
  Title,
} from '../cards/MarketingCta/common';
import { useBoot } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogsEvent, TargetType } from '../../lib/logs';
import { promotion } from './generic';

export interface MarketingCtaModalProps extends ModalProps {
  marketingCta: MarketingCta;
}
export const MarketingCtaModal = ({
  marketingCta,
  onRequestClose,
  ...modalProps
}: MarketingCtaModalProps): ReactElement => {
  const { clearMarketingCta } = useBoot();
  const { trackEvent } = useLogContext();
  const { campaignId, flags } = marketingCta;
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    flags;

  const onModalClose = (
    param: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    eventName: LogsEvent,
  ) => {
    trackEvent({
      event_name: eventName,
      target_type: TargetType.MarketingCtaPopover,
      target_id: campaignId,
    });

    const isManualCampaign = Object.values(promotion).some(
      (campaign) => campaign.campaignId === campaignId,
    );

    if (!isManualCampaign) {
      clearMarketingCta(campaignId);
    }

    onRequestClose(param);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={(event) =>
        onModalClose(event, LogsEvent.MarketingCtaDismiss)
      }
    >
      <div className="p-6 !pt-4">
        {tagColor && tagText && (
          <Header
            onClose={(event) =>
              onModalClose(event, LogsEvent.MarketingCtaDismiss)
            }
            tagColor={tagColor}
            tagText={tagText}
            buttonSize={ButtonSize.Medium}
          />
        )}
        <Title className="!typo-large-title">{title}</Title>
        {description && (
          <Description className="!typo-body">{description}</Description>
        )}
        {image && (
          <CardCover
            imageProps={{
              loading: 'lazy',
              alt: 'Post Cover',
              src: image,
              className: 'w-full my-6 !h-50',
            }}
          />
        )}
        {ctaUrl && ctaText && (
          <CTAButton
            ctaUrl={ctaUrl}
            ctaText={ctaText}
            onClick={(event) => onModalClose(event, LogsEvent.Click)}
            buttonSize={ButtonSize.Medium}
          />
        )}
      </div>
    </Modal>
  );
};

export default MarketingCtaModal;
