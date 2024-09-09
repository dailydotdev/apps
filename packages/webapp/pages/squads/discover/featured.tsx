import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { SQUAD_DIRECTORY_SOURCES } from '@dailydotdev/shared/src/graphql/squads';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { FeedContainer, SquadGrid } from '@dailydotdev/shared/src/components';
import { GetStaticPropsResult } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { Connection, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';

import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { SquadCardAction } from '@dailydotdev/shared/src/components/cards/squad/common/types';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import FeedLayout, { getLayout } from '../../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

export type Props = {
  initialData?: InfiniteData<{
    sources: Connection<Squad>;
  }>;
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Squad directory'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const SquadsPage = ({ initialData }: Props): ReactElement => {
  const { user } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const queryResult = useInfiniteQuery(
    ['sourcesFeed'],
    ({ pageParam }) =>
      gqlClient.request(SQUAD_DIRECTORY_SOURCES, {
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

  return (
    <>
      <NextSeo {...seo} />

      <FeedLayout>
        <SquadDirectoryLayout>
          <InfiniteScrolling
            isFetchingNextPage={queryResult.isFetchingNextPage}
            canFetchMore={checkFetchMore(queryResult)}
            fetchNextPage={queryResult.fetchNextPage}
            className="w-full"
          >
            <FeedContainer className="mt-2" inlineHeader>
              {queryResult?.data?.pages?.length > 0 && (
                <>
                  {queryResult.data.pages.map((page) =>
                    page.sources.edges.map(({ node }) => {
                      const { name, permalink, id, ...props } = node;
                      const action: SquadCardAction =
                        user && props?.currentMember
                          ? {
                              text: 'View Squad',
                              type: 'link',
                              href: permalink,
                            }
                          : {
                              text: 'Join Squad',
                              type: 'action',
                            };

                      if (!isTablet) {
                        return (
                          <SquadList
                            key={id}
                            squad={node}
                            action={action}
                            isUserSquad
                          />
                        );
                      }

                      return (
                        <SquadGrid
                          key={id}
                          title={name}
                          subtitle={`@${props.handle}`}
                          action={action}
                          source={{
                            name,
                            permalink,
                            id,
                            borderColor: props.color,
                            banner: props.headerImage,
                            ...props,
                          }}
                        />
                      );
                    }),
                  )}
                </>
              )}
            </FeedContainer>
          </InfiniteScrolling>
        </SquadDirectoryLayout>
      </FeedLayout>
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
    const initialData = await gqlClient.request(SQUAD_DIRECTORY_SOURCES, {
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
