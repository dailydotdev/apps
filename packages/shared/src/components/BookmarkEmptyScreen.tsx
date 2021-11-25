import React, { ReactElement } from 'react';
import BookmarkIcon from '../../icons/bookmark.svg';
import EmptyScreen from './EmptyScreen';

export default function BookmarkEmptyScreen(): ReactElement {
  return (
    <EmptyScreen
      icon={BookmarkIcon}
      title="Your bookmark list is empty."
      description="Go back to your feed and bookmark posts you’d like to keep or read
        later. Each post you bookmark will be stored here."
    />
  );
}
