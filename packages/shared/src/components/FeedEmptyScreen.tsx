import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { FilterIcon } from './icons';
import { PageContainer, SharedFeedPage } from './utilities';
import { ButtonSize } from './buttons/common';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import FeedSelector from './FeedSelector';

interface FeedEmptyScreenProps {
  feedName: SharedFeedPage;
}

function FeedEmptyScreen({ feedName }: FeedEmptyScreenProps): ReactElement {
  const { openModal } = useLazyModal();

  return (
    <>
      <PageContainer className="mx-auto">
        <FeedSelector currentFeed={feedName} className="self-start" />
        <EmptyScreenContainer>
          <FilterIcon
            className={EmptyScreenIcon.className}
            style={EmptyScreenIcon.style}
          />
          <EmptyScreenTitle>
            Your feed filters are too specific.
          </EmptyScreenTitle>
          <EmptyScreenDescription>
            We couldn&apos;t fetch enough posts based on your selected tags. Try
            adding more tags using the feed settings.
          </EmptyScreenDescription>
          <EmptyScreenButton
            onClick={() => openModal({ type: LazyModal.FeedFilters })}
            size={ButtonSize.Large}
          >
            Feed filters
          </EmptyScreenButton>
        </EmptyScreenContainer>
      </PageContainer>
    </>
  );
}

export default FeedEmptyScreen;
