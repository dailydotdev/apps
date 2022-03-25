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

type TypeProps = {
  type: string;
};

type CreateMyFeedModalProps = TypeProps & ModalProps;

type LayoutModalProps = TypeProps & Pick<ModalProps, 'onRequestClose'>;

const buttonClass = {
  v4: 'w-40',
  v5: 'w-40 ml-3',
};

const buttonSize = {
  v2: 'small',
  v3: 'medium',
};

const headerTitle = {
  v3: 'Choose tags to follow',
  v4: 'Feed filters',
  v5: 'Choose tags to follow',
};

const headerClass = {
  v4: 'flex-row-reverse',
};

const ModalFooter = ({ type, onRequestClose }: LayoutModalProps) => {
  return (
    <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
      {type === 'v5' && (
        <Button className="mr-3 w-40 btn-secondary" onClick={onRequestClose}>
          Cancel
        </Button>
      )}
      <CreateFeedFilterButton
        className={classNames(buttonClass[type], 'btn-primary-cabbage')}
      />
    </footer>
  );
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
      {type === 'v3' && (
        <Button
          className="fixed top-8 right-8 btn-tertiary-float bg-theme-bg-tertiary"
          buttonSize="large"
          title="Close"
          icon={<XIcon />}
          onClick={onRequestClose}
          position="fixed"
        />
      )}
      <header
        className={classNames(
          headerClass[type],
          'flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary',
        )}
      >
        {['v2', 'v4'].includes(type) && (
          <Button
            className="btn-tertiary"
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        )}
        <h3 className="font-bold typo-title3">{headerTitle[type]}</h3>
        {['v2', 'v3'].includes(type) && (
          <CreateFeedFilterButton
            className={classNames(buttonClass[type], 'btn-primary-cabbage')}
            buttonSize={buttonSize[type]}
            icon={type === 'v2' && <PlusIcon />}
          />
        )}
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
      {['v4', 'v5'].includes(type) && (
        <ModalFooter type={type} onRequestClose={onRequestClose} />
      )}
    </ResponsiveModal>
  );
}
