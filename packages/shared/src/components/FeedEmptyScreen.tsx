import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import FilterIcon from './icons/Filter';
import { PageContainer } from './utilities';
import { ButtonSize } from './buttons/Button';

interface FeedEmptyScreenProps {
  openFeedFilters: () => unknown;
}
function FeedEmptyScreen({
  openFeedFilters,
}: FeedEmptyScreenProps): ReactElement {
  return (
    <>
      <PageContainer className="mx-auto">
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
            onClick={openFeedFilters}
            buttonSize={ButtonSize.Large}
          >
            Feed filters
          </EmptyScreenButton>
        </EmptyScreenContainer>
      </PageContainer>
    </>
  );
}

export default FeedEmptyScreen;
