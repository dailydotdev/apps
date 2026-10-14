import type { ReactElement } from 'react';
import React from 'react';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';
import { cloudinaryCharmBookmarks } from '../lib/image';

interface BookmarkEmptyScreenProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

const defaultDescription =
  'Go back to your feed and bookmark posts you’d like to keep or read later. Each post you bookmark will be stored here.';

export default function BookmarkEmptyScreen({
  title = 'Your bookmark list is empty.',
  description = defaultDescription,
  image = cloudinaryCharmBookmarks,
  imageAlt = 'daily.dev charm holding a bookmark',
}: BookmarkEmptyScreenProps): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={image}
      imageAlt={imageAlt}
      title={title}
      description={description}
      action={{ label: 'Back to feed', href: '/' }}
    />
  );
}
