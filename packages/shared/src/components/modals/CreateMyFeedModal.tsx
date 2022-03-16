import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './AccountDetailsModal.module.css';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import PlusIcon from '../../../icons/plus.svg';
import XIcon from '../../../icons/x.svg';
import { Button } from '../buttons/Button';

export type CreateMyFeedModalProps = {
  type: string;
} & ModalProps;

const buttonClass = {
  v2: 'small',
  v3: 'medium',
  v4: 'w-40',
  v5: 'w-40',
};

export default function CreateMyFeedModal({
  className,
  onRequestClose,
  type,
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...modalProps}
      onRequestClose={onRequestClose}
    >
      <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-primary">
        {type === 'v2' && (
          <Button
            className={classNames('btn-tertiary', className)}
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        )}
        {(type === 'v3' || type === 'v5') && (
          <h3 className="pl-2 font-bold typo-title3">Choose tags to follow</h3>
        )}
        {type === 'v4' && (
          <h3 className="pl-2 font-bold typo-title3">Feed filters</h3>
        )}
        {(type === 'v2' || type === 'v3') && (
          <CreateFeedFilterButton
            className={classNames(buttonClass[type], 'btn-primary-cabbage')}
            icon={type === 'v2' && <PlusIcon />}
          />
        )}
        {type === 'v4' && (
          <Button
            className={classNames('btn-tertiary', className)}
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        )}
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
      {type === 'v4' && (
        <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary border-theme-divider-tertiary bg-theme-bg-primary">
          <CreateFeedFilterButton
            className={classNames(buttonClass[type], 'btn-primary-cabbage')}
          />
        </footer>
      )}
      {type === 'v5' && (
        <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary border-theme-divider-tertiary bg-theme-bg-primary">
          <Button className="btn-secondary w-40 mr-3" onClick={onRequestClose}>
            Cancel
          </Button>
          <CreateFeedFilterButton
            className={classNames(buttonClass[type], 'btn-primary-cabbage ml-3')}
          />
        </footer>
      )}
    </ResponsiveModal>
  );
}
