import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import PlusIcon from '../../../icons/plus.svg';
import XIcon from '../../../icons/x.svg';
import { Button } from '../buttons/Button';
import FeedFiltersIntroModal from './FeedFiltersIntroModal';

type TypeProps = {
  feedFilterModalType: string;
  showIntroModal: boolean;
  feedFilterOnboardingModalType: string;
  actionToOpenFeedFilters: () => unknown;
  onIntroClose: () => unknown;
  onCloseFeedFilterModal: () => unknown;
};

type FeedFiltersModalProps = TypeProps & ModalProps;

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

const FeedFiltersModalFooter = ({
  feedFilterModalType,
  onCloseFeedFilterModal,
}: LayoutModalProps) => {
  return (
    <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
      {feedFilterModalType === 'v5' && (
        <Button
          className="mr-3 w-40 btn-secondary"
          onClick={onCloseFeedFilterModal}
        >
          Cancel
        </Button>
      )}
      <CreateFeedFilterButton
        className={classNames(
          buttonClass[feedFilterModalType],
          'btn-primary-cabbage',
        )}
        feedFilterModalType={feedFilterModalType}
      />
    </footer>
  );
};

const FeedFiltersModal = ({
  className,
  showIntroModal,
  onCloseFeedFilterModal,
  feedFilterModalType,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  onIntroClose,
  ...modalProps
}: FeedFiltersModalProps) => {
  return (
    <ResponsiveModal
      className={classNames(className)}
      {...modalProps}
      onRequestClose={onCloseFeedFilterModal}
    >
      {feedFilterModalType === 'v3' && (
        <Button
          className="fixed top-8 right-8 btn-tertiary-float bg-theme-bg-tertiary"
          buttonSize="large"
          title="Close"
          icon={<XIcon />}
          onClick={onCloseFeedFilterModal}
          position="fixed"
        />
      )}
      <header
        className={classNames(
          headerClass[feedFilterModalType],
          'flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary',
        )}
      >
        {['v2', 'v4'].includes(feedFilterModalType) && (
          <Button
            className="btn-tertiary"
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onCloseFeedFilterModal}
          />
        )}
        <h3 className="font-bold typo-title3">
          {headerTitle[feedFilterModalType]}
        </h3>
        {['v2', 'v3'].includes(feedFilterModalType) && (
          <CreateFeedFilterButton
            className={classNames(
              buttonClass[feedFilterModalType],
              'btn-primary-cabbage',
            )}
            buttonSize={buttonSize[feedFilterModalType]}
            icon={feedFilterModalType === 'v2' && <PlusIcon />}
            feedFilterModalType={feedFilterModalType}
          />
        )}
      </header>
      <section className="mt-6">
        <TagsFilter />
      </section>
      {['v4', 'v5'].includes(feedFilterModalType) && (
        <FeedFiltersModalFooter
          feedFilterModalType={feedFilterModalType}
          onCloseFeedFilterModal={onCloseFeedFilterModal}
          showIntroModal={false}
          feedFilterOnboardingModalType={feedFilterOnboardingModalType}
          actionToOpenFeedFilters={actionToOpenFeedFilters}
          onIntroClose={onIntroClose}
        />
      )}
    </ResponsiveModal>
  );
};

export default function FeedFiltersWrapperModal({
  showIntroModal,
  onCloseFeedFilterModal,
  feedFilterModalType,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  onIntroClose,
  isOpen,
}: FeedFiltersModalProps): ReactElement {
  const [isFeedFilterModalOpen, setIsFeedFilterModalOpen] = useState(false);

  const onOpenFeedFilterModal = () => {
    if (feedFilterModalType === 'v1') {
      onIntroClose();
      actionToOpenFeedFilters();
    } else {
      setIsFeedFilterModalOpen(true);
    }
  };

  return showIntroModal && !isFeedFilterModalOpen ? (
    <FeedFiltersIntroModal
      isOpen={!isFeedFilterModalOpen}
      feedFilterOnboardingModalType={feedFilterOnboardingModalType}
      actionToOpenFeedFilters={actionToOpenFeedFilters}
      feedFilterModalType={feedFilterModalType}
      onOpenFeedFilterModal={onOpenFeedFilterModal}
      onRequestClose={onCloseFeedFilterModal}
      padding={false}
    />
  ) : (
    <FeedFiltersModal
      feedFilterModalType={feedFilterModalType}
      showIntroModal={showIntroModal}
      feedFilterOnboardingModalType={feedFilterOnboardingModalType}
      actionToOpenFeedFilters={actionToOpenFeedFilters}
      onIntroClose={onIntroClose}
      onCloseFeedFilterModal={onCloseFeedFilterModal}
      isOpen={isOpen}
    />
  );
}
