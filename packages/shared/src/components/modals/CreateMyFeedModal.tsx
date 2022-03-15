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
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        {type === 'v2' && (
          <Button
            className={classNames('btn-tertiary z-1', className)}
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        )}
        {type === 'v3' && (
          <h3 className="pl-2 font-bold typo-title3">Choose tags to follow</h3>
        )}

        <CreateFeedFilterButton
          className={classNames(buttonClass[type], 'btn-primary-cabbage')}
          icon={type === 'v2' && <PlusIcon />}
        />
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
    </ResponsiveModal>
  );
}
