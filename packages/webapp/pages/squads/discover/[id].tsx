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
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';

interface SquadCategoryPageProps {
  category: SourceCategory;
}

function SquadCategoryPage({ category }: SquadCategoryPageProps): ReactElement {
  const { result } = useSources({
    query: { categoryId: category.id, isPublic: true },
  });
  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];

  return (
    <div className="mx-auto mt-5 flex w-full flex-col px-5">
      <InfiniteScrolling
        isFetchingNextPage={result.isFetchingNextPage}
        canFetchMore={checkFetchMore(result)}
        fetchNextPage={result.fetchNextPage}
        className="flex w-full !flex-row flex-wrap gap-6"
      >
        {flatSources?.map(({ node }) => (
          <UnfeaturedSquadGrid key={node.id} source={node as Squad} />
        ))}
      </InfiniteScrolling>
    </div>
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
