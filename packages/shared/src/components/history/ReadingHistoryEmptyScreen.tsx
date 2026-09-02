import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import {
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from '../EmptyScreen';
import { EyeIcon } from '../icons';
import { Button, ButtonSize } from '../buttons/Button';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center justify-center px-6">
      <EyeIcon
        className={EmptyScreenIcon.className}
        style={EmptyScreenIcon.style}
      />
      <EmptyScreenTitle>Your reading history is empty.</EmptyScreenTitle>
      <EmptyScreenDescription>
        Go back to your feed and read posts that spark your interest. Each post
        you read will be listed here.
      </EmptyScreenDescription>
      <Link href={process.env.NEXT_PUBLIC_WEBAPP_URL ?? '/'} passHref>
        <Button tag="a" className="mt-10" size={ButtonSize.Large}>
          Back to feed
        </Button>
      </Link>
    </div>
  );
}

export default ReadingHistoryEmptyScreen;
