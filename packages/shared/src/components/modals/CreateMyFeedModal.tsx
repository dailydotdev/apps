import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './AccountDetailsModal.module.css';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';

export default function CreateMyFeedModal({
  className,
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...modalProps}
      onRequestClose={onRequestClose}
    >
      <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 flex-row-reverse justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
        <Button
          className="btn-tertiary"
          buttonSize="small"
          title="Close"
          icon={<XIcon />}
          onClick={onRequestClose}
        />
        <h3 className="font-bold typo-title3">Feed filters</h3>
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
      <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
        <CreateFeedFilterButton
          className="w-40 btn-primary-cabbage"
          feedFilterModalType="v4"
        />
      </footer>
    </ResponsiveModal>
  );
}
