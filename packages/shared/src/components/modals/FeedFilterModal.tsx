import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { Features, getFeatureValue } from '../../lib/featureManagement';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './AccountDetailsModal.module.css';
import { Button } from '../buttons/Button';
import PlusIcon from '../../../icons/plus.svg';
import TagsFilter from '../filters/TagsFilter';
import { getThemeColor } from '../utilities';
import { IFlags } from 'flagsmith';
import {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from '../../hooks/useFeedSettings';
import { AllTagCategoriesData } from '../../graphql/feedSettings';
import user from '../../../__tests__/fixture/loggedUser';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import CreateFeedFilterButton from '../CreateFeedFilterButton';

export type FeedModalProps = {
  flags: IFlags;
} & ModalProps;

export default function FeedModal({
  className,
  onRequestClose,
  flags,
  ...modalProps
}: FeedModalProps): ReactElement {

  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...modalProps}
      onRequestClose={onRequestClose}
    >
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <ModalCloseButton onClick={onRequestClose}/>
        <CreateFeedFilterButton className="btn-primary-cabbage" />
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
    </ResponsiveModal>
  );
}
