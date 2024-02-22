import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import { Modal } from './common/Modal';
import { ModalKind, ModalSize } from './common/types';
import { ButtonSize } from '../buttons/Button';
import { ModalClose } from './common/ModalClose';

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
      <ModalClose
        size={ButtonSize.Small}
        top="3"
        right="3"
        onClick={onRequestClose}
      />
      <iframe
        className="aspect-video w-full border-none"
        src={src}
        title={title}
        allow="encrypted-media;web-share"
        allowFullScreen
      />
    </Modal>
  );
}
