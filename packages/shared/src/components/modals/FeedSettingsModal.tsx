import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';

const Settings = dynamic(
  () => import(/* webpackChunkName: "settings" */ '../Settings'),
);

export function FeedSettingsModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  return (
    <ResponsiveModal {...modalProps} onRequestClose={onRequestClose}>
      <header className="py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Customize</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="overflow-auto relative flex-shrink w-full h-full max-h-full">
        <Settings />
      </section>
    </ResponsiveModal>
  );
}

export default FeedSettingsModal;
