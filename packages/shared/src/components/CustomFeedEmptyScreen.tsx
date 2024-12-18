import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { HashtagIcon } from './icons';
import { PageContainer, SharedFeedPage } from './utilities';
import { ButtonSize } from './buttons/common';
import { getFeedName } from '../lib/feed';
import { webappUrl } from '../lib/constants';
import { useAuthContext } from '../contexts/AuthContext';

export const CustomFeedEmptyScreen = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();

  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <HashtagIcon
          className={EmptyScreenIcon.className}
          style={EmptyScreenIcon.style}
        />
        <EmptyScreenTitle>Let&apos;s set up your feed!</EmptyScreenTitle>
        <EmptyScreenDescription>
          Start by configuring your feed settings to tailor content to your
          interests. Add tags, filters, and sources to make it truly yours.
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
          Set up feed
        </EmptyScreenButton>
      </EmptyScreenContainer>
    </PageContainer>
  );
};
