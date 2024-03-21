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

export interface MarketingCtaModalProps extends ModalProps {
  marketingCta: MarketingCta;
}
export const MarketingCtaModal = ({
  marketingCta,
  onRequestClose,
  ...modalProps
}: MarketingCtaModalProps): ReactElement => {
  const { clearMarketingCta } = useBoot();
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCta.flags;

  const onModalClose: typeof onRequestClose = (param) => {
    clearMarketingCta(marketingCta.campaignId);
    onRequestClose(param);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onModalClose}
    >
      <div className="p-6 !pt-4">
        {tagColor && tagText && (
          <Header
            onClose={onModalClose}
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
            onClick={onModalClose}
            buttonSize={ButtonSize.Medium}
          />
        )}
      </div>
    </Modal>
  );
};

export default MarketingCtaModal;
