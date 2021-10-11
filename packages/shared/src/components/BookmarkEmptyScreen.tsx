import React, { ReactElement } from 'react';
import Link from 'next/link';
import BookmarkIcon from '../../icons/bookmark.svg';
import { headerHeight } from '../styles/sizes';
import sizeN from '../../macros/sizeN.macro';
import { Button } from './buttons/Button';

export default function BookmarkEmptyScreen(): ReactElement {
  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center px-6 withNavBar text-theme-label-secondary"
      style={{ marginTop: headerHeight }}
    >
      <BookmarkIcon
        className="m-0 icon text-theme-label-tertiary"
        style={{ fontSize: sizeN(20) }}
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
