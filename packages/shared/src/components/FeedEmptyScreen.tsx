import type { ReactElement } from 'react';
import React from 'react';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';
import { webappUrl } from '../lib/constants';
import { cloudinaryCharmNotEnoughTags } from '../lib/image';
import { useAuthContext } from '../contexts/AuthContext';

function FeedEmptyScreen(): ReactElement | null {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmNotEnoughTags}
      imageAlt="daily.dev charm holding tags"
      title="Your feed filters are too specific."
      description="We couldn't fetch enough posts based on your selected tags. Try adding more tags using the feed settings."
      action={{
        label: 'Feed filters',
        href: `${webappUrl}feeds/${user.id}/edit`,
      }}
    />
  );
}

export default FeedEmptyScreen;
