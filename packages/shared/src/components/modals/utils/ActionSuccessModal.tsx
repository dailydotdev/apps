import type { ReactNode } from 'react';
import React from 'react';
import type { AllowedTags, ButtonProps } from '../../buttons/Button';
import { Button } from '../../buttons/Button';
import { ButtonVariant } from '../../buttons/common';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Image } from '../../image/Image';
import { ModalClose } from '../common/ModalClose';
import { useViewSize, ViewSize } from '../../../hooks';

interface ActionSuccessModalProps<T extends AllowedTags> extends ModalProps {
  cta?: ButtonProps<T> & { copy: string };
  content: {
    title: string;
    description: ReactNode;
    cover: string;
    coverDrawer?: string;
  };
}

export function ActionSuccessModal<T extends AllowedTags>({
  cta,
  content,
  ...props
}: ActionSuccessModalProps<T>): React.ReactElement {
  const { title, description, cover, coverDrawer } = content;
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col gap-3 py-1 tablet:!p-4">
        <div className="relative flex overflow-hidden rounded-16">
          <ModalClose
            className="hidden tablet:flex"
            right="0"
            onClick={props.onRequestClose}
          />
          <Image src={isTablet ? cover : coverDrawer} />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Typography type={TypographyType.Title2} center bold>
            {title}
          </Typography>
          {typeof description !== 'string' ? (
            description
          ) : (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
              center
            >
              {description}
            </Typography>
          )}
        </div>
        {cta && (
          <Button
            variant={ButtonVariant.Primary}
            className="w-full"
            type="button"
            {...cta}
          >
            {cta.copy}
          </Button>
        )}
        <Button
          variant={ButtonVariant.Tertiary}
          className="hidden w-full tablet:flex"
          type="button"
          onClick={props.onRequestClose}
        >
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
}
