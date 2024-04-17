import React, { ReactElement } from 'react';
import { LazyModalCommonProps, Modal } from '../common/Modal';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ModalClose } from '../common/ModalClose';
import { Pill } from '../../Pill';
import { Image } from '../../image/Image';

export interface PromotionProps {
  pill: { copy: string; className?: string };
  title: string;
  description: string;
  image: string;
  cta: { copy: string; link: string };
}

export function GenericPromotionalModal({
  onRequestClose,
  pill,
  title,
  description,
  image,
  cta,
  ...props
}: PromotionProps & LazyModalCommonProps): ReactElement {
  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="items-center !pt-4 tablet:items-start">
        <div className="flex w-full flex-row items-center justify-between">
          <Pill
            label={pill.copy}
            className={
              pill.className ??
              'bg-theme-overlay-float-cabbage text-brand-default'
            }
          />
          <ModalClose
            position="relative"
            className="right-0"
            onClick={onRequestClose}
          />
        </div>
        <div className="mt-5 flex flex-col gap-6">
          <h1 className="font-bold typo-large-title">{title}</h1>
          <p className="text-text-secondary typo-body">{description}</p>
          <Image src={image} className="w-full rounded-16 object-cover" />
          <Button
            tag="a"
            href={cta.link}
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onRequestClose}
          >
            {cta.copy}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default GenericPromotionalModal;
