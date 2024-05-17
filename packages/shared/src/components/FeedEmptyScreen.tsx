import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
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
import { getFeedName } from '../lib/feed';

function FeedEmptyScreen(): ReactElement {
  const { openModal } = useLazyModal();
  const router = useRouter();
  const feedName = getFeedName(router.pathname);

  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <FilterIcon
          className={EmptyScreenIcon.className}
          style={EmptyScreenIcon.style}
        />
        <EmptyScreenTitle>Your feed filters are too specific.</EmptyScreenTitle>
        <EmptyScreenDescription>
          We couldn&apos;t fetch enough posts based on your selected tags. Try
          adding more tags using the feed settings.
        </EmptyScreenDescription>
        <EmptyScreenButton
          onClick={() => {
            if (feedName === SharedFeedPage.Custom) {
              router.replace(`/feeds/${router.query.slug}/edit`);
            } else {
              openModal({ type: LazyModal.FeedFilters });
            }
          }}
          size={ButtonSize.Large}
        >
          Feed filters
        </EmptyScreenButton>
      </EmptyScreenContainer>
    </PageContainer>
  );
}

export default FeedEmptyScreen;
