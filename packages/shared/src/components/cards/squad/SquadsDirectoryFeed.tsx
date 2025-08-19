import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SourcesQueryProps } from '../../../hooks/source/useSources';
import { useSources } from '../../../hooks/source/useSources';
import HorizontalScroll from '../../HorizontalScroll/HorizontalScroll';
import { UnfeaturedSquadGrid } from './UnfeaturedSquadGrid';
import { SquadGrid } from './SquadGrid';
import { useViewSize, ViewSize } from '../../../hooks';
import { SquadList } from './SquadList';
import { Button, ButtonVariant } from '../../buttons/Button';
import { PlaceholderSquadGridList } from './PlaceholderSquadGrid';
import { PlaceholderSquadListList } from './PlaceholderSquadList';
import Link from '../../utilities/Link';
import type { HorizontalScrollTitleProps } from '../../HorizontalScroll/HorizontalScrollHeader';
import { HorizontalScrollTitle } from '../../HorizontalScroll/HorizontalScrollHeader';
import { useFetchAd } from '../../../features/monetization/useFetchAd';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

interface SquadHorizontalListProps {
  title: HorizontalScrollTitleProps;
  query: SourcesQueryProps;
  linkToSeeAll: string;
  className?: string;
  children?: ReactNode;
  isFirstItemAd?: boolean;
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
  isFirstItemAd,
}: SquadHorizontalListProps): ReactElement {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { user } = useAuthContext();
  const { result } = useSources<Squad>({ query, isEnabled: inView });
  const { isFetched } = result;
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLoading = !isFetched || (!inView && !result.data);
  const { fetchAd } = useFetchAd();
  const { data: ad, isLoading: isLoadingAd } = useQuery({
    queryKey: generateQueryKey(RequestKey.Ads, user, 'squads_directory'),
    queryFn: () => fetchAd({ squadOnly: true, active: true }),
    enabled: isFirstItemAd,
  });

  const adSource = ad?.data?.source;
  const flatSources = useMemo(() => {
    const map = result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

    if (adSource) {
      map.unshift({ node: adSource });
    }

    return map;
  }, [result.data?.pages, adSource]);

  if (
    (flatSources.length === 0 && isFetched) ||
    (isFirstItemAd && isLoadingAd)
  ) {
    return null;
  }

  if (isMobile && isFetched) {
    return (
      <div ref={ref} className="relative flex flex-col gap-3 pb-6">
        {children}
        <header className="mb-2 flex flex-row items-center justify-between">
          <HorizontalScrollTitle {...title} />
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
        {flatSources?.map(({ node }, index) => (
          <SquadList
            key={node.id}
            squad={node}
            campaignId={
              adSource && index === 0 ? adSource.flags?.campaignId : undefined
            }
          />
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
      {flatSources?.map(({ node }, index) =>
        node.flags?.featured && linkToSeeAll.includes('featured') ? (
          <SquadGrid
            key={node.id}
            source={node}
            className="w-80"
            campaignId={
              adSource && index === 0 ? adSource.flags?.campaignId : undefined
            }
          />
        ) : (
          <UnfeaturedSquadGrid key={node.id} source={node} className="w-80" />
        ),
      )}
      {isLoading && <Skeleton isFeatured={query.featured} />}
    </HorizontalScroll>
  );
}
