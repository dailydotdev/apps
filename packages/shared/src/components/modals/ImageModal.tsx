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
      // `bg-overlay-quaternary-onion`. The backdrop blur softens the page
      // behind it. The blur also makes the overlay the containing block for the
      // fixed close button below, but since the overlay fills the viewport that
      // resolves to the screen corner all the same.
      overlayClassName="!bg-overlay-primary-pepper backdrop-blur-md"
      // The image is the surface — drop the modal's own background/border/shadow.
      className="!border-0 !bg-transparent !shadow-none tablet:!bg-transparent"
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] w-full rounded-16 object-contain"
      />
      {/* Pinned to the screen's top-right corner (not the image) so a busy
          image can't camouflage it. Primary (solid) variant stays visible over
          the dark overlay. */}
      <CloseButton
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="fixed right-4 top-4 z-1"
        onClick={onRequestClose}
      />
    </Modal>
  );
}
