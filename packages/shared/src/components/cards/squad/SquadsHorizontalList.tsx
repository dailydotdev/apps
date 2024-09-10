import React, { ReactElement, ReactNode } from 'react';
import { Squad } from '../../../graphql/sources';
import {
  SourcesQueryProps,
  useSources,
} from '../../../hooks/source/useSources';
import HorizontalScroll from '../../HorizontalScroll/HorizontalScroll';
import { UnfeaturedSquadGrid } from './UnfeaturedSquadGrid';
import { SquadGrid } from './SquadGrid';

interface SquadHorizontalListProps {
  title: ReactNode;
  query: SourcesQueryProps;
  linkToSeeAll: string;
  className?: string;
}

export function SquadHorizontalList({
  query,
  title,
  linkToSeeAll,
  className,
}: SquadHorizontalListProps): ReactElement {
  const { result } = useSources<Squad>({ query });

  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  if (flatSources.length === 0) {
    return null;
  }

  return (
    <HorizontalScroll
      className={{ container: className, scroll: 'gap-6' }}
      scrollProps={{ title, linkToSeeAll }}
    >
      {flatSources?.map(({ node }) =>
        node.flags?.featured ? (
          <SquadGrid key={node.id} source={node} className="max-w-80" />
        ) : (
          <UnfeaturedSquadGrid
            key={node.id}
            source={node}
            className="max-w-76"
          />
        ),
      )}
    </HorizontalScroll>
  );
}
