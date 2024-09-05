import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

import { useLazyModal } from '../hooks/useLazyModal';
import { webappUrl } from '../lib/constants';
import { getFeedName } from '../lib/feed';
import { ButtonSize } from './buttons/common';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { FilterIcon } from './icons';
import { LazyModal } from './modals/common/types';
import { PageContainer, SharedFeedPage } from './utilities';

function FeedEmptyScreen(): ReactElement {
  const { openModal } = useLazyModal();
  const router = useRouter();

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
            const feedName = getFeedName(router.pathname);

            if (feedName === SharedFeedPage.Custom && router.query?.slugOrId) {
              router.replace(`${webappUrl}feeds/${router.query.slugOrId}/edit`);
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
