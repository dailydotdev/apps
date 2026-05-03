import type { ReactNode } from 'react';
import React from 'react';
import type { AllowedTags, ButtonV2Props } from '../../buttons/ButtonV2';
import { ButtonV2 } from '../../buttons/ButtonV2';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { ModalCloseProps } from '../common/ModalClose';
import { ModalClose } from '../common/ModalClose';
import { useViewSize, ViewSize } from '../../../hooks';
import { Image } from '../../image/Image';

interface ActionSuccessModalProps<T extends AllowedTags> extends ModalProps {
  cta?: ButtonV2Props<T> & { copy: string };
  secondaryCta?: ButtonV2Props<T> & { copy: string };
  content: {
    title: string;
    description: string;
    body?: ReactNode;
    cover?: string;
    coverDrawer?: string;
  };
  withCloseOnTablet?: boolean;
  modalCloseButtonProps?: ModalCloseProps;
}

export function ActionSuccessModal<T extends AllowedTags>({
  cta,
  secondaryCta,
  content,
  withCloseOnTablet,
  modalCloseButtonProps,
  ...props
}: ActionSuccessModalProps<T>): React.ReactElement {
  const { title, description, body, cover, coverDrawer } = content;
  const isTablet = useViewSize(ViewSize.Tablet);
  const image = isTablet ? cover : coverDrawer || cover;

  return (
    <Modal
      size={Modal.Size.Small}
      kind={Modal.Kind.FixedCenter}
      {...props}
      isOpen
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col gap-3 py-1 tablet:!p-4">
        <div className="relative flex flex-row overflow-hidden rounded-16">
          <ModalClose
            className="hidden tablet:flex"
            right="2"
            top="2"
            size={ButtonSize.Small}
            onClick={props.onRequestClose}
            variant={ButtonVariant.Primary}
            {...modalCloseButtonProps}
          />
          {image && (
            <div className="relative h-full max-h-56 min-h-52 w-full">
              <Image className="absolute" src={image} alt="Success" />
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Typography
            type={
              props.size === Modal.Size.XSmall
                ? TypographyType.Title3
                : TypographyType.Title2
            }
            center
            bold
          >
            {title}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={
              isTablet ? TypographyColor.Secondary : TypographyColor.Tertiary
            }
            center
          >
            {description}
          </Typography>
        </div>
        {body}
        {cta && (
          <ButtonV2
            variant={ButtonVariant.Primary}
            className="w-full"
            type="button"
            {...cta}
          >
            {cta.copy}
          </ButtonV2>
        )}
        {secondaryCta && (
          <ButtonV2
            variant={ButtonVariant.Float}
            className="w-full"
            type="button"
            {...secondaryCta}
          >
            {secondaryCta.copy}
          </ButtonV2>
        )}
        {withCloseOnTablet && (
          <ButtonV2
            variant={ButtonVariant.Float}
            className="hidden w-full tablet:flex"
            type="button"
            onClick={props.onRequestClose}
          >
            Close
          </ButtonV2>
        )}
      </Modal.Body>
    </Modal>
  );
}
