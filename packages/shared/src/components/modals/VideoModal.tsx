import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';

import { ButtonSize } from '../buttons/Button';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { ModalKind, ModalSize } from './common/types';

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
