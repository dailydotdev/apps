import React, { ReactElement } from 'react';
import { UserHighlight } from '@dailydotdev/shared/src/components/widgets/PostUsersHighlights';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SitesIcon } from '@dailydotdev/shared/src/components/icons';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useQuery } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  MOST_RECENT_SOURCES_QUERY,
  POPULAR_SOURCES_QUERY,
  Source,
  TOP_VIDEO_SOURCES_QUERY,
  TRENDING_SOURCES_QUERY,
} from '@dailydotdev/shared/src/graphql/sources';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { BreadCrumbs, ListItem, TopList } from '../../components/common';

const PlaceholderList = classed(
  ElementPlaceholder,
  'h-[1.6875rem] my-1.5 rounded-12',
);

const SourceTopList = ({
  items,
  isLoading,
  ...props
}: {
  title: string;
  items: Source[];
  isLoading: boolean;
  className?: string;
}): ReactElement => {
  return (
    <TopList {...props}>
      <>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {isLoading && [...Array(10)].map((_, i) => <PlaceholderList key={i} />)}
        {items?.map((item, i) => (
          <ListItem key={item.id} index={i + 1} href={item.permalink}>
            <UserHighlight
              {...item}
              className={{
                wrapper: 'min-w-0 flex-shrink !p-2',
                image: '!h-8 !w-8',
                textWrapper: '!ml-2',
                name: '!typo-caption1',
                handle: '!typo-caption2',
              }}
              allowSubscribe={false}
            />
          </ListItem>
        ))}
      </>
    </TopList>
  );
};

const SourcesPage = (): ReactElement => {
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const { data: recentlyAddedSources, isLoading: recentLoading } = useQuery(
    [RequestKey.MostRecentSources, null, 'recent'],
    async () =>
      await request<{ sources: Source[] }>(
        graphqlUrl,
        MOST_RECENT_SOURCES_QUERY,
      ),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: trendingSources, isLoading: trendingLoading } = useQuery(
    [RequestKey.TrendingSources, null, 'trending'],
    async () =>
      await request<{ sources: Source[] }>(graphqlUrl, TRENDING_SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: popularSources, isLoading: popularLoading } = useQuery(
    [RequestKey.PopularSources, null, 'popular'],
    async () =>
      await request<{ sources: Source[] }>(graphqlUrl, POPULAR_SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: topVideoSources, isLoading: topVideoLoading } = useQuery(
    [RequestKey.TopVideoSources, null, 'popular'],
    async () =>
      await request<{ sources: Source[] }>(graphqlUrl, TOP_VIDEO_SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  return (
    <main className="py-6 tablet:px-4 laptop:px-10">
      <div className="flex justify-between">
        <BreadCrumbs>
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<SitesIcon secondary />}
            disabled
          >
            Sources
          </Button>
        </BreadCrumbs>
        <Button
          icon={<PlusIcon />}
          variant={isLaptop ? ButtonVariant.Secondary : ButtonVariant.Float}
          className="mb-6 ml-4 tablet:ml-0 laptop:float-right"
          onClick={() => openModal({ type: LazyModal.NewSource })}
        >
          Suggest new source
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-4">
        <SourceTopList
          title="Trending sources"
          items={trendingSources?.sources}
          isLoading={trendingLoading}
        />
        <SourceTopList
          title="Popular sources"
          items={popularSources?.sources}
          isLoading={popularLoading}
        />
        <SourceTopList
          title="Recently added sources"
          items={recentlyAddedSources?.sources}
          isLoading={recentLoading}
        />
        <SourceTopList
          title="Top video sources"
          items={topVideoSources?.sources}
          isLoading={topVideoLoading}
        />
      </div>
    </main>
  );
};

const getSourcesPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SourcesPage.getLayout = getSourcesPageLayout;
SourcesPage.layoutProps = {
  screenCentered: false,
};
export default SourcesPage;
