import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenTitle,
} from './EmptyScreen';
import { PageContainer } from './utilities/common';
import { ButtonSize } from './buttons/common';
import { webappUrl } from '../lib/constants';
import { cloudinaryCharmNotEnoughTags } from '../lib/image';
import { Image } from './image/Image';
import { useAuthContext } from '../contexts/AuthContext';

function FeedEmptyScreen(): ReactElement | null {
  const router = useRouter();
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <Image
          className="h-40 w-40 object-contain"
          src={cloudinaryCharmNotEnoughTags}
          alt="daily.dev charm holding tags"
          loading="lazy"
        />
        <EmptyScreenTitle>Your feed filters are too specific.</EmptyScreenTitle>
        <EmptyScreenDescription>
          We couldn&apos;t fetch enough posts based on your selected tags. Try
          adding more tags using the feed settings.
        </EmptyScreenDescription>
        <EmptyScreenButton
          onClick={() => {
            router.push(`${webappUrl}feeds/${user.id}/edit`);
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
