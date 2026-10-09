import type { ReactElement } from 'react';
import React from 'react';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';
import { webappUrl } from '../lib/constants';
import { cloudinaryCharmEmptySquads } from '../lib/image';

function FollowingFeedEmptyScreen(): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmEmptySquads}
      imageAlt="daily.dev charm waving in an empty squad"
      title="Nothing from your follows yet"
      description="Posts from the people, squads and sources you follow land here."
      action={{ label: 'Find people or squads', href: `${webappUrl}squads` }}
    />
  );
}

export default FollowingFeedEmptyScreen;
