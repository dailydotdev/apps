import type { ReactElement } from 'react';
import React from 'react';
import type ReactModal from 'react-modal';
import { Modal } from './common/Modal';
import { ModalKind, ModalSize } from './common/types';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';

interface ImageModalProps extends ReactModal.Props {
  src: string;
  alt?: string;
}

export default function ImageModal({
  onRequestClose,
  src,
  alt = 'Image',
  ...props
}: ImageModalProps): ReactElement {
  return (
    <Modal
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.XLarge}
      onRequestClose={onRequestClose}
      // A photo lightbox needs a darker tint than the default modal overlay so
      // the image stands out; `!` wins the conflict with the base
      // `bg-overlay-quaternary-onion`.
      overlayClassName="!bg-overlay-primary-pepper"
      // The image is the surface — drop the modal's own background/border/shadow.
      className="!border-0 !bg-transparent !shadow-none tablet:!bg-transparent"
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] w-full rounded-16 object-contain"
      />
      {/* Rendered after the image and given an explicit z-index so it paints
          above it regardless of stacking-context edge cases. Primary (solid)
          variant stays visible over any image, unlike Float. */}
      <CloseButton
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="absolute right-3 top-3 z-1"
        onClick={onRequestClose}
      />
    </Modal>
  );
}
