import type { ReactElement } from 'react';
import React from 'react';
import { CharmEmptyState } from './charm/CharmEmptyState';
import { cloudinaryCharmSearchNoResults } from '../lib/image';

export default function SearchEmptyScreen(): ReactElement {
  return (
    <CharmEmptyState
      className="max-w-[32rem] self-center"
      image={cloudinaryCharmSearchNoResults}
      imageAlt="daily.dev charm searching with a magnifying glass"
      title="No results found"
      description="We couldn’t find any posts matching your search. Try different keywords."
    />
  );
}
