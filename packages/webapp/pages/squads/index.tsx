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
import {
  FeedContainer,
  SquadGrid,
  SourceCardBorderColor,
  SquadsDirectoryHeader,
} from '@dailydotdev/shared/src/components';
import { EditIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { squadsPublicSuggestion } from '@dailydotdev/shared/src/lib/constants';
import { GetStaticPropsResult } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { Connection, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';

import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import FeedLayout, { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

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
            {/* TODO: remove SquadsDirectoryHeader on MI-510 */}
            <FeedContainer
              header={<SquadsDirectoryHeader className="hidden laptop:flex" />}
              footer={
                <SquadsDirectoryHeader className="mt-5 flex laptop:hidden" />
              }
              className="mt-5 px-6"
              inlineHeader
            >
              {queryResult?.data?.pages?.length > 0 && (
                <>
                  {queryResult.data.pages.map((page) =>
                    page.sources.edges.reduce(
                      (nodes, { node: { name, permalink, id, ...props } }) => {
                        const isMember = user && props?.currentMember;

                        nodes.push(
                          <SquadGrid
                            key={id}
                            title={name}
                            subtitle={`@${props.handle}`}
                            action={{
                              text: isMember ? 'View Squad' : 'Join Squad',
                              type: isMember ? 'link' : 'action',
                              href: isMember ? permalink : undefined,
                            }}
                            source={{
                              name,
                              permalink,
                              id,
                              borderColor: props.color,
                              banner: props.headerImage,
                              ...props,
                            }}
                          />,
                        );

                        return nodes;
                      },
                      [],
                    ),
                  )}
                  {/* TODO: remove this on MI-510 */}
                  <SquadGrid
                    title="Which squads would you like to see next?"
                    action={{
                      type: 'link',
                      text: 'Submit your idea',
                      href: squadsPublicSuggestion,
                      target: '_blank',
                    }}
                    icon={
                      <EditIcon
                        size={IconSize.XXLarge}
                        className="text-text-tertiary"
                      />
                    }
                    description="We're thrilled to see how our community has grown and evolved, thanks to your incredible support. Let your voice be heard and be part of the decision-making process."
                    borderColor={SourceCardBorderColor.Pepper}
                  />
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
