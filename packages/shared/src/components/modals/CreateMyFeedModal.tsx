import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './AccountDetailsModal.module.css';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import PlusIcon from '../../../icons/plus.svg';
import XIcon from '../../../icons/x.svg';
import { Button, ButtonSize } from '../buttons/Button';

export type TypeProps = {
  type: string;
};

export type CreateMyFeedModalProps = TypeProps & ModalProps;

export type LayoutModalProps = TypeProps & Partial<ModalProps>;

export type CloseButtonProps = {
  size?: ButtonSize;
  position?: string;
  closeButtonClassName?: string;
} & Partial<ModalProps>;

const buttonClass = {
  v2: 'small',
  v3: 'medium',
  v4: 'w-40',
  v5: 'w-40 ml-3',
};

const headerTitle = {
  v3: 'Choose tags to follow',
  v4: 'Feed filters',
  v5: 'Choose tags to follow',
};

const getFooter = ({ type, onRequestClose }: LayoutModalProps) => {
  return (
    <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary border-theme-divider-tertiary bg-theme-bg-tertiary">
      {type === 'v4' && (
        <CreateFeedFilterButton
          className={classNames(buttonClass[type], 'btn-primary-cabbage')}
        />
      )}
      {type === 'v5' && (
        <>
          <Button className="btn-secondary w-40 mr-3" onClick={onRequestClose}>
            Cancel
          </Button>
          <CreateFeedFilterButton
            className={classNames(buttonClass[type], 'btn-primary-cabbage')}
          />
        </>
      )}
    </footer>
  );
};

const getCloseButton = ({
  closeButtonClassName,
  position,
  size,
  onRequestClose,
}: CloseButtonProps) => {
  return (
    <Button
      className={classNames('btn-tertiary', closeButtonClassName)}
      buttonSize={size || 'small'}
      title="Close"
      icon={<XIcon />}
      onClick={onRequestClose}
      position={position || ''}
    />
  );
};

export default function CreateMyFeedModal({
  className,
  onRequestClose,
  type,
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  return (
    <>
      <ResponsiveModal
        className={classNames(className, styles.accountDetailsModal)}
        {...modalProps}
        onRequestClose={onRequestClose}
      >
        {type === 'v3' &&
          getCloseButton({
            closeButtonClassName:
              'btn-tertiary-float bg-theme-bg-tertiary fixed top-8 right-8',
            position: 'fixed',
            size: 'large',
            onRequestClose,
          })}
        <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
          {type === 'v2' && getCloseButton({ onRequestClose })}

          <h3 className="pl-2 font-bold typo-title3">{headerTitle[type]}</h3>
          {(type === 'v2' || type === 'v3') && (
            <CreateFeedFilterButton
              className={classNames(buttonClass[type], 'btn-primary-cabbage')}
              icon={type === 'v2' && <PlusIcon />}
            />
          )}
          {type === 'v4' && getCloseButton({ onRequestClose })}
        </header>
        <section className="mt-6">
          <TagsFilter />
        </section>
        {(type === 'v4' || type === 'v5') &&
          getFooter({ type, onRequestClose })}
      </ResponsiveModal>
    </>
  );
}
