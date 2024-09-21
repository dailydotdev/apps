import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { PlaceholderSquadGridList } from './PlaceholderSquadGrid';
import { PlaceholderSquadListList } from './PlaceholderSquadList';

interface SquadHorizontalListProps {
  title: ReactNode;
  query: SourcesQueryProps;
  linkToSeeAll: string;
  className?: string;
  children?: ReactNode;
}

const Skeleton = ({ isFeatured }: { isFeatured?: boolean }): ReactElement => (
  <>
    <PlaceholderSquadGridList
      className="!hidden tablet:!flex laptop:w-80"
      isFeatured={isFeatured}
    />
    <div className="tablet:!hidden">
      <PlaceholderSquadListList />
    </div>
  </>
);

export function SquadsDirectoryFeed({
  query,
  title,
  linkToSeeAll,
  className,
  children,
}: SquadHorizontalListProps): ReactElement {
  const { result } = useSources<Squad>({ query });
  const { isInitialLoading } = result;
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();

  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  if (flatSources.length === 0 && !isInitialLoading) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="relative flex flex-col gap-3 pb-6">
        {children}
        <header className="mb-2 flex flex-row items-center justify-between">
          {title}
          <Link href={linkToSeeAll} passHref>
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={() => router.push(linkToSeeAll)}
              aria-label="See all"
              tag="a"
            >
              See all
            </Button>
          </Link>
        </header>
        {flatSources?.map(({ node }) => (
          <SquadList key={node.id} squad={node} />
        ))}
        {isInitialLoading && <Skeleton />}
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
          <SquadGrid key={node.id} source={node} className="w-80" />
        ) : (
          <UnfeaturedSquadGrid key={node.id} source={node} className="w-80" />
        ),
      )}
      {isInitialLoading && <Skeleton isFeatured={query.featured} />}
    </HorizontalScroll>
  );
}
