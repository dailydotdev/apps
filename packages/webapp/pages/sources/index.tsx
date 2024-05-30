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
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  Source,
  SOURCE_DIRECTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/sources';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { GetStaticPropsResult } from 'next';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
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

interface SourcesPageProps {
  mostRecentSources: Source[];
  trendingSources: Source[];
  popularSources: Source[];
  topVideoSources: Source[];
}

const SourcesPage = ({
  mostRecentSources,
  trendingSources,
  popularSources,
  topVideoSources,
}: SourcesPageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (isLoading) {
    return <></>;
  }

  return (
    <main className="py-6 tablet:px-4 laptop:px-10">
      <div className="flex justify-between">
        <BreadCrumbs>
          <>
            <SitesIcon size={IconSize.XSmall} secondary /> Sources
          </>
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
          items={trendingSources}
          isLoading={isLoading}
        />
        <SourceTopList
          title="Popular sources"
          items={popularSources}
          isLoading={isLoading}
        />
        <SourceTopList
          title="Recently added sources"
          items={mostRecentSources}
          isLoading={isLoading}
        />
        <SourceTopList
          title="Top video sources"
          items={topVideoSources}
          isLoading={isLoading}
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

export async function getStaticProps(): Promise<
  GetStaticPropsResult<SourcesPageProps>
> {
  try {
    const res = await request<SourcesPageProps>(
      graphqlUrl,
      SOURCE_DIRECTORY_QUERY,
    );

    return {
      props: {
        mostRecentSources: res.mostRecentSources,
        trendingSources: res.trendingSources,
        popularSources: res.popularSources,
        topVideoSources: res.topVideoSources,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        err?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          mostRecentSources: null,
          trendingSources: null,
          popularSources: null,
          topVideoSources: null,
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
