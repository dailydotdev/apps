import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import { Modal } from './common/Modal';
import { ModalKind, ModalSize } from './common/types';
import CloseButton from '../CloseButton';
import { ButtonSize } from '../buttons/ButtonV2';

interface VideoModalProps extends ReactModal.Props {
  src: string;
  title: string;
}

export default function VideoModal({
  onRequestClose,
  src,
  title,
  ...props
}: VideoModalProps): ReactElement {
  return (
    <Modal
      className="px-8"
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.XLarge}
      onRequestClose={onRequestClose}
      {...props}
    >
      <CloseButton
        size={ButtonSize.Small}
        className="top-3 right-3 !absolute"
        onClick={onRequestClose}
      />
      <iframe
        className="w-full border-none aspect-video"
        src={src}
        title={title}
        allow="encrypted-media;web-share"
        allowFullScreen
      />
    </Modal>
  );
}
