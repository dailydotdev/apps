import React, { ReactElement, useContext } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout } from '../../components/layouts/MainLayout';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { SOURCES_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import InfiniteScrolling, { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { Spaciness } from '@dailydotdev/shared/src/graphql/settings';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';

const seo: NextSeoProps = {
  title: `Squads`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const SquadsPage = ({
  forceCardMode,
}): ReactElement => {
  const { sidebarRendered } = useSidebarRendered();
  // const {
  //   openNewTab,
  //   spaciness,
  //   insaneMode: listMode,
  //   loadedSettings,
  // } = useContext(SettingsContext);
  // const insaneMode = !forceCardMode && listMode;
  // const numCards = currentSettings.numCards[spaciness ?? 'eco'];

  const queryResult = useInfiniteQuery(
    ['sourcesFeed'],
    ({ pageParam }) =>
      request(graphqlUrl, SOURCES_QUERY, {
        filterOpenSquads: true,
        first: 100,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.notifications?.pageInfo?.hasNextPage &&
        lastPage?.notifications?.pageInfo?.endCursor,
    },
  );

  // const useList = insaneMode && numCards > 1;

  // const listGaps = {
  //   cozy: 'gap-5',
  //   roomy: 'gap-3',
  // };
  // const gridGaps = {
  //   cozy: 'gap-14',
  //   roomy: 'gap-12',
  // };
  // const getFeedGapPx = {
  //   'gap-2': 8,
  //   'gap-3': 12,
  //   'gap-5': 20,
  //   'gap-8': 32,
  //   'gap-12': 48,
  //   'gap-14': 56,
  // };

  // const gapClass = (useList: boolean, spaciness: Spaciness) =>
  // useList ? listGaps[spaciness] ?? 'gap-2' : gridGaps[spaciness] ?? 'gap-8';

  // const cardListClass = {
  //   1: 'grid-cols-1',
  //   2: 'grid-cols-2',
  //   3: 'grid-cols-3',
  //   4: 'grid-cols-4',
  //   5: 'grid-cols-5',
  //   6: 'grid-cols-6',
  //   7: 'grid-cols-7',
  // };

  // const cardClass = (useList: boolean, numCards: number): string =>
  // useList ? 'grid-cols-1' : cardListClass[numCards];

  

  return (
    <>
      <NextSeo {...seo} />

      <BaseFeedPage className="relative pt-2 laptop:pt-8 mb-4">
        <div
          className={classNames(
            'absolute top-0 w-full h-full squad-background-fade',
            sidebarRendered && '-left-full translate-x-[60%]',
          )}
        />

        <InfiniteScrolling
          isFetchingNextPage={queryResult.isFetchingNextPage}
          canFetchMore={checkFetchMore(queryResult)}
          fetchNextPage={queryResult.fetchNextPage}
        >
          <>
            {/* <div
              className={classNames(
                'grid',
                gapClass(useList, spaciness),
                cardClass(useList, numCards),
              )}
            > */}
              {queryResult?.data?.pages?.length > 0 &&
                queryResult.data.pages.map((page) => 
                  page.sources.edges.reduce(
                    (nodes, { node: { id, name, image } }) => {
                      nodes.push(
                        <SourcesCard id={id} name={name} image={image} />
                      );

                      console.log('nodes: ', nodes);
                      return nodes;
                    },
                    [],
                  )
              )}
            {/* </div> */}
            
            <p>LAST CARD</p>
          </>
        </InfiniteScrolling>
      </BaseFeedPage>
    </>
  );
};

const SourcesCard = ({id, name, image}) => {
  return (
    <div className='bg-theme-primary'>Card: {id}</div>
  )
}

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = mainFeedLayoutProps;

export default SquadsPage;
