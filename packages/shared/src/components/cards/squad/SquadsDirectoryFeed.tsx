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
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
import { SquadList } from './SquadList';
import { Button, ButtonVariant } from '../../buttons/Button';
import { PlaceholderSquadGridList } from './PlaceholderSquadGrid';
import { PlaceholderSquadListList } from './PlaceholderSquadList';
import Link from '../../utilities/Link';
import type { HorizontalScrollTitleProps } from '../../HorizontalScroll/HorizontalScrollHeader';
import { HorizontalScrollTitle } from '../../HorizontalScroll/HorizontalScrollHeader';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { fetchDirectoryAd } from '../../../lib/ads';
import { LogExtraContextProvider } from '../../../contexts/LogExtraContext';
import type { Ad } from '../../../graphql/posts';

interface SquadHorizontalListProps {
  title: HorizontalScrollTitleProps;
  query: SourcesQueryProps;
  linkToSeeAll: string;
  className?: string;
  children?: ReactNode;
  firstItemShouldBeAd?: boolean;
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

const SquadItemLogExtraContext = ({
  ad,
  children,
}: {
  ad?: Ad;
  children: ReactNode;
}) => {
  return (
    <LogExtraContextProvider
      selector={() => {
        if (!ad?.generationId) {
          return undefined;
        }

        return {
          gen_id: ad.generationId,
        };
      }}
    >
      {children}
    </LogExtraContextProvider>
  );
};

export function SquadsDirectoryFeed({
  query,
  title,
  linkToSeeAll,
  className,
  children,
  firstItemShouldBeAd = false,
}: SquadHorizontalListProps): ReactElement {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { user, isAuthReady } = useAuthContext();
  const { result } = useSources<Squad>({ query, isEnabled: inView });
  const { isFetched } = result;
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLoading = !isFetched || (!inView && !result.data);
  const { data: ad, isLoading: isLoadingAd } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Ads,
      user,
      'squads_directory',
      title.copy,
    ),
    queryFn: fetchDirectoryAd,
    enabled: firstItemShouldBeAd && isAuthReady && !user?.isPlus,
  });
  const { squad: squadAd } = useSquad({ handle: ad?.data?.source?.handle });

  const adSource = ad?.data?.source;
  const flatSources = useMemo(() => {
    const map = result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

    if (firstItemShouldBeAd && squadAd) {
      const index = map.findIndex(({ node }) => node.id === squadAd.id);

      if (index >= 0) {
        delete map[index]; // to avoid displaying duplicate
      }

      map.unshift({ node: squadAd });
    }

    return map;
  }, [result.data?.pages, firstItemShouldBeAd, squadAd]);

  if (flatSources.length === 0 && isFetched) {
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
          <SquadItemLogExtraContext key={node.id} ad={ad}>
            <SquadList
              squad={node}
              campaignId={
                adSource && index === 0 ? adSource.flags?.campaignId : undefined
              }
            />
          </SquadItemLogExtraContext>
        ))}
        {(isLoading || isLoadingAd) && <Skeleton />}
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
      {!isLoadingAd &&
        flatSources?.map(({ node }, index) => {
          const shouldShowAd = adSource && index === 0;
          const showFeaturedCard =
            shouldShowAd ||
            (node.flags?.featured && linkToSeeAll.includes('featured'));

          return showFeaturedCard ? (
            <SquadItemLogExtraContext key={node.id} ad={ad}>
              <SquadGrid
                source={node}
                className="w-80"
                campaignId={
                  shouldShowAd ? adSource.flags?.campaignId : undefined
                }
              />
            </SquadItemLogExtraContext>
          ) : (
            <UnfeaturedSquadGrid key={node.id} source={node} className="w-80" />
          );
        })}
      {(isLoading || isLoadingAd) && <Skeleton isFeatured={query.featured} />}
    </HorizontalScroll>
  );
}
