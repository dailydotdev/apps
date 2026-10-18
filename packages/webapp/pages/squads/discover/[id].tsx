import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React from 'react';
import type { SourceCategory } from '@dailydotdev/shared/src/graphql/source/categories';
import { getSourceCategory } from '@dailydotdev/shared/src/graphql/source/categories';
import {
  useSources,
  getFlatteredSources,
} from '@dailydotdev/shared/src/hooks/source/useSources';
import { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { SquadDiscoverListPage } from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverListPage';
import { isBrowsableSquad } from '@dailydotdev/shared/src/features/squads/components/discover/common';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import type { DynamicSeoProps } from '../../../components/common';

interface SquadCategoryPageProps extends DynamicSeoProps {
  category: SourceCategory;
}

function SquadCategoryPage({ category }: SquadCategoryPageProps): ReactElement {
  const { result } = useSources<Squad>({
    query: {
      sortByMembersCount: true,
      categoryId: category.id,
      isPublic: true,
    },
  });

  return (
    <SquadDirectoryLayout>
      <SquadDiscoverListPage
        slot={`category_${category.id}`}
        topic={category.title}
        squads={getFlatteredSources(result).filter(isBrowsableSquad)}
        isLoading={result.isPending}
        fetchNextPage={result.fetchNextPage}
        canFetchMore={checkFetchMore(result)}
        isFetchingNextPage={result.isFetchingNextPage}
      />
    </SquadDirectoryLayout>
  );
}

SquadCategoryPage.getLayout = getLayout;
SquadCategoryPage.layoutProps = mainFeedLayoutProps;

export default SquadCategoryPage;

interface SquadPageParams extends ParsedUrlQuery {
  id: string;
}

const redirect = {
  destination: `/squads/discover`,
  permanent: false,
};

export async function getServerSideProps({
  params,
  res,
}: GetServerSidePropsContext<SquadPageParams>): Promise<
  GetServerSidePropsResult<SquadCategoryPageProps>
> {
  const id = params?.id;

  if (!id) {
    return { redirect };
  }

  const setCacheHeader = () => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneHour}, stale-while-revalidate=${StaleTime.OneHour}`,
    );
  };

  try {
    const category = await getSourceCategory(id);

    setCacheHeader();

    const seoTitles = getPageSeoTitles(`Explore ${category?.title} Squads`);
    const seo = {
      title: seoTitles.title,
      openGraph: { ...seoTitles.openGraph },
      description: `Find the best Squads in the ${category?.title} category on daily.dev. Connect with like-minded developers and collaborate on the latest technologies.`,
    };

    return { props: { category, seo } };
  } catch (err) {
    return { redirect };
  }
}
