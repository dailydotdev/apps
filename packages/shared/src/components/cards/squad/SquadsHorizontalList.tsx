import React, { ReactElement, ReactNode } from 'react';
import { Squad } from '../../../graphql/sources';
import {
  SourcesQueryProps,
  useSources,
} from '../../../hooks/source/useSources';
import HorizontalScroll from '../../HorizontalScroll/HorizontalScroll';
import { UnfeaturedSquadGrid } from './UnfeaturedSquadGrid';

interface SquadHorizontalListProps {
  title: ReactNode;
  query: SourcesQueryProps;
  linkToSeeAll: string;
}

export function SquadHorizontalList({
  query,
  title,
  linkToSeeAll,
}: SquadHorizontalListProps): ReactElement {
  const { result } = useSources({ query });

  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  return (
    <HorizontalScroll
      className={{ container: 'mx-16' }}
      scrollProps={{ title, linkToSeeAll }}
    >
      {flatSources?.map(({ node }) => (
        <UnfeaturedSquadGrid key={node.id} source={node as Squad} />
      ))}
    </HorizontalScroll>
  );
}
