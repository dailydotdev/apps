import React, { ReactElement } from 'react';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { UpvoterList, UpvoterListProps } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';

export interface UpvotedPopupModalProps extends ModalProps {
  listProps: UpvoterListProps;
  listPlaceholderProps?: UpvoterListPlaceholderProps;
}

export function UpvotedPopupModal({
  listProps,
  listPlaceholderProps = {},
  onRequestClose,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  return (
    <ResponsiveModal
      {...modalProps}
      onRequestClose={onRequestClose}
      style={{
        content: { padding: 0, maxHeight: '40rem', maxWidth: '30rem' },
      }}
    >
      <header className="py-4 px-6 border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section>
        {listProps.upvotes?.length > 0 ? (
          <UpvoterList {...listProps} />
        ) : (
          <UpvoterListPlaceholder {...listPlaceholderProps} />
        )}
      </section>
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
