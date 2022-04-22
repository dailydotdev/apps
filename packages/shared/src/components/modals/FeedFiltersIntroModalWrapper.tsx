import React, { ReactElement, useState } from 'react';
import { ModalProps } from './StyledModal';
import CreateMyFeedIntroModal from './CreateMyFeedIntroModal';
import CreateMyFeedModal from './FeedFiltersModal';

type TypeProps = {
  feedFilterOnboardingModalType: string;
  actionToOpenFeedFilters: () => unknown;
  feedFilterModalType: string;
};

type CreateMyFeedModalProps = TypeProps & ModalProps;

export default function FeedFiltersIntroModalWrapper({
  isOpen,
  onRequestClose,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  feedFilterModalType,
}: CreateMyFeedModalProps): ReactElement {
  const [isFeedFilterModalOpen, setIsFeedFilterModalOpen] = useState(false);

  const onOpenFeedFilterModal = (
    event: React.MouseEvent<Element, MouseEvent>,
  ): void => {
    if (feedFilterModalType === 'v1') {
      actionToOpenFeedFilters();
      onRequestClose(event);
    } else setIsFeedFilterModalOpen(true);
  };

  return !isFeedFilterModalOpen ? (
    <CreateMyFeedIntroModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      feedFilterOnboardingModalType={feedFilterOnboardingModalType}
      actionToOpenFeedFilters={actionToOpenFeedFilters}
      feedFilterModalType={feedFilterModalType}
      onOpenFeedFilterModal={onOpenFeedFilterModal}
    />
  ) : (
    <CreateMyFeedModal
      isOpen={isFeedFilterModalOpen}
      onRequestClose={onRequestClose}
      feedFilterModalType={feedFilterModalType}
    />
  );
}
