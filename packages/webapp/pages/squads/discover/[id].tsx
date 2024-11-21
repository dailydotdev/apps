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
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { PlaceholderSquadGridList } from '@dailydotdev/shared/src/components/cards/squad/PlaceholderSquadGrid';
import { PlaceholderSquadListList } from '@dailydotdev/shared/src/components/cards/squad/PlaceholderSquadList';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { DynamicSeoProps } from '../../../components/common';

interface SquadCategoryPageProps extends DynamicSeoProps {
  category: SourceCategory;
}

const Skeleton = (): ReactElement => (
  <>
    <FeedContainer className="!hidden tablet:!flex">
      <PlaceholderSquadGridList />
    </FeedContainer>
    <div className="flex flex-col gap-3 tablet:!hidden" role="list">
      <PlaceholderSquadListList />
    </div>
  </>
);

function SquadCategoryPage({ category }: SquadCategoryPageProps): ReactElement {
  const { result } = useSources({
    query: {
      sortByMembersCount: true,
      categoryId: category.id,
      isPublic: true,
    },
  });
  const { isInitialLoading } = result;
  const flatSources =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    <SquadDirectoryLayout>
      <InfiniteScrolling
        isFetchingNextPage={result.isFetchingNextPage}
        canFetchMore={checkFetchMore(result)}
        fetchNextPage={result.fetchNextPage}
        className="w-full"
      >
        {isTablet ? (
          <FeedContainer>
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
      {isInitialLoading && <Skeleton />}
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

export const runtime = 'experimental-edge';

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

    const seo = {
      title: getTemplatedTitle(`Explore ${category?.title} Squads`),
      description: `Find the best Squads in the ${category?.title} category on daily.dev. Connect with like-minded developers and collaborate on the latest technologies.`,
    };

    return { props: { category, seo } };
  } catch (err) {
    return { redirect };
  }
}
