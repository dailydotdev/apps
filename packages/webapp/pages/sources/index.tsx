import React, { ReactElement, useMemo } from 'react';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { UserHighlight } from '@dailydotdev/shared/src/components/widgets/PostUsersHighlights';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  HomeIcon,
  PlusIcon,
  SitesIcon,
} from '@dailydotdev/shared/src/components/icons';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useQuery } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '@dailydotdev/shared/src/lib/query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  POPULAR_SOURCES_QUERY,
  Source,
  SOURCES_QUERY,
  SourceType,
  TOP_VIDEO_SOURCES_QUERY,
  TRENDING_SOURCES_QUERY,
} from '@dailydotdev/shared/src/graphql/sources';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { BreadCrumbsWrapper, ListItem } from '../../components/common';

// TODO: REMOVE WHEN I HAVE SOME DATA
// const mockProps: Source = {
//   id: 'daily_updates',
//   handle: 'daily_updates',
//   name: 'daily.dev changelog',
//   permalink: 'http://webapp.local.com:5002/sources/daily_updates',
//   image:
//     'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/172d19bda1bd403f9497a9d29a3ed99b',
//   type: SourceType.Squad,
//   public: true,
// };

const TopList = ({
  title,
  items,
}: {
  title: string;
  items: Source[];
}): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const MobileDiv = classed(
    'div',
    'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
  );
  const CardElement = classed(Card, '!max-h-none !p-4');
  const Wrapper = isMobile ? MobileDiv : CardElement;
  return (
    <Wrapper>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">
        {items?.map((item, i) => (
          <ListItem key={item.id} index={i + 1} href={item.permalink}>
            <UserHighlight
              {...item}
              className={{
                wrapper: '!p-2',
                image: '!h-8 !w-8',
                textWrapper: '!ml-2',
                name: '!typo-caption1',
                handle: '!typo-caption2',
              }}
              allowSubscribe={false}
            />
          </ListItem>
        ))}
      </ol>
    </Wrapper>
  );
};

const SourcesPage = (): ReactElement => {
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const { data } = useQuery(
    [RequestKey.Sources, null, 'all'],
    async () => await request<{ sources: Source[] }>(graphqlUrl, SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: trendingSources } = useQuery(
    [RequestKey.TrendingSources, null, 'trending'],
    async () =>
      await request<{ sources: Source[] }>(graphqlUrl, TRENDING_SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const { data: popularSources } = useQuery(
    [RequestKey.PopularSources, null, 'popular'],
    async () =>
      await request<{ sources: Source[] }>(graphqlUrl, POPULAR_SOURCES_QUERY),
    {
      staleTime: StaleTime.OneHour,
    },
  );

  const recentlyAddedSources = useMemo(() => {
    return data?.sources
      ?.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [data]);

  const { data: topVideoSources } = useQuery(
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
        <BreadCrumbsWrapper>
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<HomeIcon secondary />}
            tag="a"
            href={process.env.NEXT_PUBLIC_WEBAPP_URL}
            size={ButtonSize.XSmall}
          />
          /
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<SitesIcon secondary />}
            disabled
          >
            Sources
          </Button>
        </BreadCrumbsWrapper>
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
        <TopList title="Trending sources" items={trendingSources?.sources} />
        <TopList title="Popular sources" items={popularSources?.sources} />
        <TopList title="Recently added sources" items={recentlyAddedSources} />
        <TopList title="Top video sources" items={topVideoSources?.sources} />
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
