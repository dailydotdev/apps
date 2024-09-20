import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement } from 'react';
import {
  getSourceCategory,
  SourceCategory,
} from '@dailydotdev/shared/src/graphql/source/categories';
import { useSources } from '@dailydotdev/shared/src/hooks/source/useSources';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { FeedContainer } from '@dailydotdev/shared/src/components';
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { NextSeo } from 'next-seo';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { defaultSeo } from '../../../next-seo';

interface SquadCategoryPageProps {
  category: SourceCategory;
}

function SquadCategoryPage({ category }: SquadCategoryPageProps): ReactElement {
  const { result } = useSources({
    query: {
      sortByMembersCount: true,
      categoryId: category.id,
      isPublic: true,
    },
  });
  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];
  const isTablet = useViewSize(ViewSize.Tablet);

  const title = `${category?.title} Directory`;
  const description = `Explore the ${category?.title} Squads on daily.dev, where developers share insights, collaborate on projects, and discuss the latest trends. Join a squad that matches your interests and elevate your developer journey.`;

  return (
    <SquadDirectoryLayout>
      <NextSeo {...defaultSeo} title={title} description={description} />
      <InfiniteScrolling
        isFetchingNextPage={result.isFetchingNextPage}
        canFetchMore={checkFetchMore(result)}
        fetchNextPage={result.fetchNextPage}
        className="flex w-full !flex-row flex-wrap gap-6"
      >
        {isTablet ? (
          <FeedContainer className="mt-5" inlineHeader>
            {flatSources?.map(({ node }) => (
              <UnfeaturedSquadGrid key={node.id} source={node as Squad} />
            ))}
          </FeedContainer>
        ) : (
          <div className="flex flex-col gap-3" role="list">
            {flatSources.map(({ node }) => (
              <SquadList role="listitem" key={node.id} squad={node as Squad} />
            ))}
          </div>
        )}
      </InfiniteScrolling>
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
  const { id } = params;

  const setCacheHeader = () => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${oneHour}, stale-while-revalidate=${oneHour}`,
    );
  };

  try {
    const category = await getSourceCategory(id);

    setCacheHeader();

    return { props: { category } };
  } catch (err) {
    return { redirect };
  }
}
