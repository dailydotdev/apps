import React, { ReactElement, ReactNode } from 'react';
import { Squad } from '../../../graphql/sources';
import {
  SourcesQueryProps,
  useSources,
} from '../../../hooks/source/useSources';
import HorizontalScroll from '../../HorizontalScroll/HorizontalScroll';
import { UnfeaturedSquadGrid } from './UnfeaturedSquadGrid';
import { SquadGrid } from './SquadGrid';
import { useViewSize, ViewSize } from '../../../hooks';
import { SquadList } from './SquadList';
import { Button, ButtonVariant } from '../../buttons/Button';

interface SquadHorizontalListProps {
  title: ReactNode;
  query: SourcesQueryProps;
  linkToSeeAll: string;
  className?: string;
  children?: ReactNode;
}

export function SquadsDirectoryFeed({
  query,
  title,
  linkToSeeAll,
  className,
  children,
}: SquadHorizontalListProps): ReactElement {
  const { result } = useSources<Squad>({ query });
  const isMobile = useViewSize(ViewSize.MobileL);

  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  if (flatSources.length === 0) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="relative flex flex-col gap-3 pb-6">
        {children}
        <header className="mb-2 flex flex-row items-center justify-between">
          {title}
          <Button variant={ButtonVariant.Tertiary}>See all</Button>
        </header>
        {flatSources?.map(({ node }) => (
          <SquadList key={node.id} squad={node} />
        ))}
      </div>
    );
  }

  return (
    <HorizontalScroll
      className={{ container: className, scroll: 'gap-6' }}
      scrollProps={{ title, linkToSeeAll }}
    >
      {children}
      {flatSources?.map(({ node }) =>
        node.flags?.featured && linkToSeeAll.includes('featured') ? (
          <SquadGrid key={node.id} source={node} className="max-w-80" />
        ) : (
          <UnfeaturedSquadGrid
            key={node.id}
            source={node}
            className="max-w-80"
          />
        ),
      )}
    </HorizontalScroll>
  );
}
