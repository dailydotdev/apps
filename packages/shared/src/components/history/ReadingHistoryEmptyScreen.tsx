import Link from 'next/link';
import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from '../EmptyScreen';
import EyeIcon from '../icons/Eye';
import { ButtonSize } from '../buttons/Button';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <div className="flex flex-col flex-1 justify-center items-center px-6 mt-20">
      <EyeIcon
        className={EmptyScreenIcon.className}
        style={EmptyScreenIcon.style}
      />
      <EmptyScreenTitle>Your reading history is empty.</EmptyScreenTitle>
      <EmptyScreenDescription>
        Go back to your feed and read posts that spark your interest. Each post
        you read will be listed here.
      </EmptyScreenDescription>
      <Link href={process.env.NEXT_PUBLIC_WEBAPP_URL}>
        <EmptyScreenButton buttonSize={ButtonSize.Large}>
          Back to feed
        </EmptyScreenButton>
      </Link>
    </div>
  );
}

export default ReadingHistoryEmptyScreen;
