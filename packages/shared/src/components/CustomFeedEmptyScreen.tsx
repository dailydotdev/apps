import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { HashtagIcon } from './icons';
import { PageContainer } from './utilities';
import { ButtonSize } from './buttons/common';
import { webappUrl } from '../lib/constants';
import { usePlusSubscription } from '../hooks';
import { DeleteCustomFeed } from './buttons/DeleteCustomFeed';

export const CustomFeedEmptyScreen = (): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const router = useRouter();

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
        <div className="flex flex-col items-center gap-4 tablet:flex-row">
          <EmptyScreenButton
            onClick={() => {
              router.push(`${webappUrl}feeds/${router.query.slugOrId}/edit`);
            }}
            size={ButtonSize.Large}
          >
            Set up feed
          </EmptyScreenButton>
          {!isPlus ? (
            <DeleteCustomFeed
              className="mt-10"
              feedId={router.query.slugOrId as string}
            />
          ) : null}
        </div>
      </EmptyScreenContainer>
    </PageContainer>
  );
};
