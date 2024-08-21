import React, { ReactElement } from 'react';
import { GetStaticPropsResult } from 'next';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';

import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SitesIcon } from '@dailydotdev/shared/src/components/icons';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Source,
  SOURCE_DIRECTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/sources';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { SourceTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Sources squad | daily.dev',
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore the top content sources on daily.dev. Discover, subscribe, and stay updated with the best content from leading developer communities and blogs.',
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
    <>
      <NextSeo {...seo} />
      <PageWrapperLayout className="py-6">
        <div className="flex justify-between">
          <BreadCrumbs>
            <SitesIcon size={IconSize.XSmall} secondary /> Sources
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
            containerProps={{ title: 'Trending sources' }}
            items={trendingSources}
            isLoading={isLoading}
          />
          <SourceTopList
            containerProps={{ title: 'Popular sources' }}
            items={popularSources}
            isLoading={isLoading}
          />
          <SourceTopList
            containerProps={{ title: 'Recently added sources' }}
            items={mostRecentSources}
            isLoading={isLoading}
          />
          <SourceTopList
            containerProps={{ title: 'Top video sources' }}
            items={topVideoSources}
            isLoading={isLoading}
          />
        </div>
      </PageWrapperLayout>
    </>
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
    const res = await gqlClient.request<SourcesPageProps>(
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
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          mostRecentSources: [],
          trendingSources: [],
          popularSources: [],
          topVideoSources: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
