import React, { ReactElement, useContext } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import { SOURCES_QUERY } from '@dailydotdev/shared/src/graphql/squads';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeedContainer,
  SquadGrid,
  SquadsDirectoryHeader,
} from '@dailydotdev/shared/src/components';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { GetStaticPropsResult } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import ConditionalWrapper from '@dailydotdev/shared/src/components/ConditionalWrapper';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import {
  useSquadNavigation,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { SourcesQueryData } from '@dailydotdev/shared/src/hooks/source/useSources';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import FeedLayout, { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

export type Props = {
  initialData?: InfiniteData<SourcesQueryData<Squad>>;
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Squad directory'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const SquadsPage = ({ initialData }: Props): ReactElement => {
  const { squads } = useContext(AuthContext);
  const { openNewSquad } = useSquadNavigation();

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
  const hasSquad = !!squads?.length;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTabbedContainer = !isLaptop && hasSquad;
  const flapSquads = queryResult?.data?.pages?.flatMap(
    (page) => page.sources.edges,
  );

  return (
    <>
      <NextSeo {...seo} />

      <FeedLayout>
        <BaseFeedPage className="relative mb-4 flex-col pt-2 laptop:pt-8">
          <span
            className={classNames(
              'flex w-full flex-row items-center justify-between px-4 pb-2 typo-body laptop:hidden',
              !hasSquad && 'border-b border-border-subtlest-tertiary',
            )}
          >
            <strong>Squads</strong>
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => openNewSquad({ origin: Origin.SquadDirectory })}
            >
              New Squad
            </Button>
          </span>
          <ConditionalWrapper
            condition={isTabbedContainer}
            wrapper={(component) => (
              <TabContainer className={{ container: 'w-full' }}>
                <Tab
                  label="Your squads"
                  className="grid grid-cols-1 gap-4 px-4 py-5"
                >
                  {squads.map((squad) => (
                    <SquadList key={squad.handle} squad={squad} isUserSquad />
                  ))}
                </Tab>
                <Tab label="Public squads" className="px-4">
                  {component}
                </Tab>
              </TabContainer>
            )}
          >
            <InfiniteScrolling
              isFetchingNextPage={queryResult.isFetchingNextPage}
              canFetchMore={checkFetchMore(queryResult)}
              fetchNextPage={queryResult.fetchNextPage}
              className="w-full"
            >
              {/* TODO: remove SquadsDirectoryHeader on MI-510 */}
              <FeedContainer
                header={
                  <SquadsDirectoryHeader className="hidden laptop:flex" />
                }
                footer={
                  <SquadsDirectoryHeader className="mt-5 flex laptop:hidden" />
                }
                className="mt-5 px-6"
                inlineHeader
              >
                {flapSquads?.map(({ node }) => (
                  <SquadGrid key={node.id} source={node} />
                ))}
              </FeedContainer>
            </InfiniteScrolling>
          </ConditionalWrapper>
        </BaseFeedPage>
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
