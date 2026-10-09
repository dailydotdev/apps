import type { ReactElement } from 'react';
import React from 'react';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';
import { SharedFeedPage } from './utilities/common';
import { webappUrl } from '../lib/constants';
import {
  cloudinaryCharmNoPosts,
  cloudinaryCharmNotEnoughTags,
} from '../lib/image';
import { useAuthContext } from '../contexts/AuthContext';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';

function FeedEmptyScreen(): ReactElement | null {
  const { user } = useAuthContext();
  const { feedName } = useActiveFeedNameContext();

  if (!user) {
    return null;
  }

  if (feedName === SharedFeedPage.MyFeed) {
    return (
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmNotEnoughTags}
        imageAlt="daily.dev charm holding tags"
        title="Your feed filters are too specific"
        description="Not enough posts match your tags yet. Add a few more and your feed fills up."
        action={{
          label: 'Feed settings',
          href: `${webappUrl}feeds/${user.id}/edit`,
        }}
      />
    );
  }

  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmNoPosts}
      imageAlt="daily.dev charm waiting for posts"
      title="No posts for this sort yet"
      description="Posts show up here as soon as they land. Try another sort meanwhile."
    />
  );
}

export default FeedEmptyScreen;
