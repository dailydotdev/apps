import type { ReactElement } from 'react';
import React from 'react';
import { CharmEmptyState } from './charm/CharmEmptyState';
import { cloudinaryCharmSearchNoResults } from '../lib/image';

interface SearchEmptyScreenProps {
  description?: string;
}

export default function SearchEmptyScreen({
  description = 'We couldn’t find any posts matching your search. Try different keywords.',
}: SearchEmptyScreenProps): ReactElement {
  return (
    <CharmEmptyState
      className="max-w-[32rem] self-center"
      image={cloudinaryCharmSearchNoResults}
      imageAlt="daily.dev charm searching with a magnifying glass"
      title="No results found"
      description={description}
    />
  );
}
