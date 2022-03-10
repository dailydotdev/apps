import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import { StyledModal, ModalProps } from '../StyledModal';
import { ModalCloseButton } from '../ModalCloseButton';
import LoginButtons from '../../LoginButtons';
import styles from '.././LoginModal.module.css';
import { useTrackModal } from '../../../hooks/useTrackModal';
import FeaturesContext from '../../../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../../../lib/featureManagement';
import { ResponsiveModal } from '../ResponsiveModal';
import { ModalHeader } from '../common';
import { Button } from '../../buttons/Button';
import XIcon from '../../../../icons/x.svg';
import PlusIcon from '../../../../icons/plus.svg';
import { SearchField } from '../../fields/SearchField';
import TagCategoryDropdown from '../../filters/TagCategoryDropdown';
import useFeedSettings from '../../../hooks/useFeedSettings';
import TagsFilter from '../../filters/TagsFilter';

export type LoginModalProps = {
  trigger: string;
} & ModalProps;

export default function FeedModal({
  className,
  children,
  style,
  ...props
}: ModalProps): ReactElement {

  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...props}
    >
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <ModalCloseButton onClick={props.onRequestClose} />
        <Button
          className="mr-3 btn-primary"
          buttonSize="small"
          type="submit"
          icon={<PlusIcon />}
        >
          Create
        </Button>
      </header>
      <section className="flex flex-col py-6 px-6 mobileL:px-10">
        <TagsFilter />
      </section>
    </ResponsiveModal>
  );
}
