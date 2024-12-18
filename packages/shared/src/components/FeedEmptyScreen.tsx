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
import { getFeedName } from '../lib/feed';
import { webappUrl } from '../lib/constants';
import { useAuthContext } from '../contexts/AuthContext';

function FeedEmptyScreen(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();

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

            router.push(
              `${webappUrl}feeds/${
                feedName === SharedFeedPage.Custom
                  ? router.query.slugOrId
                  : user.id
              }/edit`,
            );
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
