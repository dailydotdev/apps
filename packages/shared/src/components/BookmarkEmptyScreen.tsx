import React, { ReactElement } from 'react';
import Link from 'next/link';
import BookmarkIcon from './icons/Bookmark';
import { Button } from './buttons/Button';
import { EmptyScreenIcon } from './EmptyScreen';

export default function BookmarkEmptyScreen(): ReactElement {
  return (
    <main className="withNavBar inset-0 mx-auto mt-12 flex max-w-full flex-col items-center justify-center px-6 text-theme-label-secondary">
      <BookmarkIcon
        className="icon m-0 text-theme-label-tertiary"
        style={EmptyScreenIcon.style}
      />
      <h1
        className="my-4 text-center text-theme-label-primary typo-title1"
        style={{ maxWidth: '32.5rem' }}
      >
        Your bookmark list is empty.
      </h1>
      <p className="mb-10 text-center" style={{ maxWidth: '32.5rem' }}>
        Go back to your feed and bookmark posts you’d like to keep or read
        later. Each post you bookmark will be stored here.
      </p>
      <Link href="/" passHref>
        <Button className="btn-primary" tag="a" buttonSize="large">
          Back to feed
        </Button>
      </Link>
    </main>
  );
}
