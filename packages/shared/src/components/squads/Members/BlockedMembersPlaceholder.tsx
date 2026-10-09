import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmEmptySquads } from '../../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../charm/CharmEmptyState';

export function BlockedMembersPlaceholder(): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmEmptySquads}
      imageAlt="daily.dev charm waving in an empty squad"
      title="No blocked members"
      description="Members you block from this Squad are listed here."
    />
  );
}
