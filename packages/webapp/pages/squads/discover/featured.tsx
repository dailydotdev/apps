import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { SOURCES_QUERY } from '@dailydotdev/shared/src/graphql/squads';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { FeedContainer, SquadGrid } from '@dailydotdev/shared/src/components';
import { GetStaticPropsResult } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { SourcesQueryData } from '@dailydotdev/shared/src/hooks/source/useSources';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';

export type Props = {
  initialData?: InfiniteData<SourcesQueryData<Squad>>;
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Squad directory'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const SquadsPage = ({ initialData }: Props): ReactElement => {
  const queryResult = useInfiniteQuery(
    ['sourcesFeed'],
    ({ pageParam }) =>
      gqlClient.request(SOURCES_QUERY, {
        filterOpenSquads: true,
        featured: true,
        first: 100,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.sources?.pageInfo?.hasNextPage &&
        lastPage?.sources?.pageInfo?.endCursor,
      initialData,
      staleTime: StaleTime.Default,
    },
  );
  const isTablet = useViewSize(ViewSize.Tablet);
  const flatSquads = queryResult?.data?.pages?.flatMap(
    (page) => page.sources.edges,
  );

  return (
    <>
      <NextSeo {...seo} />

      <SquadDirectoryLayout>
        {isTablet ? (
          <InfiniteScrolling
            isFetchingNextPage={queryResult.isFetchingNextPage}
            canFetchMore={checkFetchMore(queryResult)}
            fetchNextPage={queryResult.fetchNextPage}
            className="w-full"
          >
            <FeedContainer className="mt-5" inlineHeader>
              {flatSquads?.map(({ node }) => (
                <SquadGrid key={node.id} source={node} />
              ))}
            </FeedContainer>
          </InfiniteScrolling>
        ) : (
          <>
            {flatSquads.map(({ node }) => {
              const { id } = node;
              return <SquadList key={id} squad={node} />;
            })}
          </>
        )}
      </SquadDirectoryLayout>
    </>
  );
};

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <CustomAuthBanner />,
};

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  try {
    const initialData = await gqlClient.request(SOURCES_QUERY, {
      filterOpenSquads: true,
      featured: true,
      first: 100,
      after: undefined,
    });

    return {
      props: {
        initialData: {
          pages: [initialData],
          pageParams: [null],
        },
      },
      revalidate: oneHour,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);

    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      return {
        props: {},
        revalidate: oneHour,
      };
    }

    throw err;
  }
}

export default SquadsPage;
