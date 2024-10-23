import React, { ReactElement, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
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
import Link from '../../utilities/Link';
import { useIsHydrated } from '../../../hooks/utils/useIsHydrated';

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
  const isHydrated = useIsHydrated();
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { result } = useSources<Squad>({ query, isEnabled: inView });
  const { isFetched } = result;
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLoading = !isFetched || (!inView && !result.data);

  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  if (flatSources.length === 0 && isFetched) {
    return null;
  }

  if (isMobile && isHydrated) {
    return (
      <div ref={ref} className="relative flex flex-col gap-3 pb-6">
        {children}
        <header className="mb-2 flex flex-row items-center justify-between">
          {title}
          <Link href={linkToSeeAll} passHref>
            <Button
              variant={ButtonVariant.Tertiary}
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
        {isLoading && <Skeleton />}
      </div>
    );
  }

  return (
    <HorizontalScroll
      ref={ref}
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
      {isLoading && <Skeleton isFeatured={query.featured} />}
    </HorizontalScroll>
  );
}
