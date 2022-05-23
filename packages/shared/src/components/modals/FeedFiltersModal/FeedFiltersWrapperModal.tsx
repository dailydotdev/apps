import React, { ReactElement, useState } from 'react';
import FeedFiltersIntroModal from './FeedFiltersIntroModal';
import FeedFiltersModal, { FeedFiltersModalProps } from './FeedFiltersModal';

export default function FeedFiltersWrapperModal({
  showIntroModal,
  feedFilterModalType,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  onIntroClose,
  isOpen,
  onRequestClose,
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
      onRequestClose={onRequestClose}
      padding={false}
    />
  ) : (
    <FeedFiltersModal
      feedFilterModalType={feedFilterModalType}
      showIntroModal={showIntroModal}
      feedFilterOnboardingModalType={feedFilterOnboardingModalType}
      actionToOpenFeedFilters={actionToOpenFeedFilters}
      onIntroClose={onIntroClose}
      onRequestClose={onRequestClose}
      isOpen={isOpen}
      padding={false}
    />
  );
}
