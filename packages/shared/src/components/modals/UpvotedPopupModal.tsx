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
  children,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  return (
    <ResponsiveModal
      {...modalProps}
      onRequestClose={onRequestClose}
      style={{
        content: {
          position: 'relative',
          padding: 0,
          maxHeight: '40rem',
          maxWidth: '30rem',
          overflow: 'hidden',
        },
      }}
    >
      <header className="py-4 px-6 border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="relative flex-shrink h-full max-h-full overflow-auto">
        {listProps.upvotes?.length > 0 ? (
          <UpvoterList {...listProps}>{children}</UpvoterList>
        ) : (
          <UpvoterListPlaceholder {...listPlaceholderProps} />
        )}
      </section>
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
