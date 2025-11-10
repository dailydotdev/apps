import type { ReactElement } from 'react';
import React from 'react';
import { BookmarkIcon } from './icons';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import Link from './utilities/Link';
import type { IconProps } from './Icon';
import { IconSize } from './Icon';

interface BookmarkEmptyScreenProps {
  title?: string;
  description?: string;
  iconProps?: IconProps;
}

const defaultDescription =
  'Go back to your feed and bookmark posts you’d like to keep or read later. Each post you bookmark will be stored here.';

export default function BookmarkEmptyScreen({
  title = 'Your bookmark list is empty.',
  description = defaultDescription,
  iconProps = {},
}: BookmarkEmptyScreenProps): ReactElement {
  return (
    <main className="withNavBar text-text-secondary inset-0 mx-auto mt-12 flex max-w-full flex-col items-center justify-center px-6">
      <BookmarkIcon
        {...iconProps}
        className="icon text-text-disabled m-0"
        size={IconSize.XXXLarge}
        secondary
      />
      <h1
        className="text-text-primary typo-title1 my-4 text-center"
        style={{ maxWidth: '32.5rem' }}
      >
        {title}
      </h1>
      <p
        className="text-text-tertiary mb-10 text-center"
        style={{ maxWidth: '32.5rem' }}
      >
        {description}
      </p>
      <Link href="/" passHref>
        <Button variant={ButtonVariant.Primary} tag="a" size={ButtonSize.Large}>
          Back to feed
        </Button>
      </Link>
    </main>
  );
}
