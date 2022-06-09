import Link from 'next/link';
import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from '../EmptyScreen';
import EyeIcon from '../icons/Eye';
import { PageContainer } from '../utilities';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <EyeIcon
          className={EmptyScreenIcon.className}
          style={EmptyScreenIcon.style}
        />
        <EmptyScreenTitle>Your reading history is empty.</EmptyScreenTitle>
        <EmptyScreenDescription>
          Go back to your feed and read posts that spark your interest. Each
          post you read will be listed here.
        </EmptyScreenDescription>
        <Link href={process.env.NEXT_PUBLIC_WEBAPP_URL}>
          <EmptyScreenButton buttonSize="large">Back to feed</EmptyScreenButton>
        </Link>
      </EmptyScreenContainer>
    </PageContainer>
  );
}

export default ReadingHistoryEmptyScreen;
