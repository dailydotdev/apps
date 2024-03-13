import React, { ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';
import { CardCover } from '../cards/common/CardCover';
import type { MarketingCTA } from '../cards/MarketingCTA/common';
import {
  CTAButton,
  Description,
  Header,
  Title,
} from '../cards/MarketingCTA/common';

export interface NewRankModalProps extends ModalProps {
  marketingCTA: MarketingCTA;
}
export const MarketingCTAModal = ({
  marketingCTA,
  onRequestClose,
  ...modalProps
}: NewRankModalProps): ReactElement => {
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCTA.flags;

  const onModalClose: typeof onRequestClose = (param) => {
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

export default MarketingCTAModal;
