import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmEmptySquads } from '../../lib/image';
import { link } from '../../lib/links';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

function SquadEmptyScreen(): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmEmptySquads}
      imageAlt="daily.dev charm waving in an empty squad"
      title="No posts yet"
      description="Share the first post and it shows up here for every member."
      action={{ label: 'New post', href: link.post.create }}
    />
  );
}

export default SquadEmptyScreen;
