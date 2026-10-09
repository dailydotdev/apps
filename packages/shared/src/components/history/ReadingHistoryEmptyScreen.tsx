import type { ReactElement } from 'react';
import React from 'react';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';
import { webappUrl } from '../../lib/constants';
import { cloudinaryCharmReadLater } from '../../lib/image';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      image={cloudinaryCharmReadLater}
      imageAlt="daily.dev charm kicking back to read posts later"
      title="Nothing read yet"
      description="Every post you open is kept here so you can find it again."
      action={{ label: 'Browse Popular', href: `${webappUrl}popular` }}
    />
  );
}

export default ReadingHistoryEmptyScreen;
