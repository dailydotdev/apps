import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import FilterIcon from '../../icons/outline/filter.svg';
import { PageContainer } from './utilities';
import { useDynamicLoadedAnimation } from '../hooks/useDynamicLoadAnimated';
import FeedFilters from './filters/FeedFilters';

function FeedEmptyScreen(): ReactElement {
  const {
    isLoaded,
    isAnimated,
    setLoaded: openFeedFilters,
    setHidden,
  } = useDynamicLoadedAnimation();

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
            We couldn&apos;t fetch enough articles based on your selected tags.
            Try adding more tags using the feed settings.
          </EmptyScreenDescription>
          <EmptyScreenButton onClick={openFeedFilters} buttonSize="large">
            Feed filters
          </EmptyScreenButton>
        </EmptyScreenContainer>
      </PageContainer>
      {isLoaded && (
        <FeedFilters
          isOpen={isAnimated}
          onBack={setHidden}
          directlyOpenedTab="Manage tags"
        />
      )}
    </>
  );
}

export default FeedEmptyScreen;
