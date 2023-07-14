import React, { ReactElement, useContext } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout } from '../../components/layouts/MainLayout';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { SOURCES_QUERY, SourceMember } from '@dailydotdev/shared/src/graphql/sources';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import InfiniteScrolling, { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { Spaciness } from '@dailydotdev/shared/src/graphql/settings';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SquadMemberShortList from '@dailydotdev/shared/src/components/squads/SquadMemberShortList';
import { Connection } from '@dailydotdev/shared/src/graphql/common';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { FeedContainer } from '@dailydotdev/shared/src/components';

const seo: NextSeoProps = {
  title: `Squads`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

interface SourceProps {
  handle: string;
  id: string;
  image: string;
  name: string;
  public: boolean;
  type: string
  description: string;
  membersCount: number;
  members: Connection<SourceMember>;
}

const SquadsPage = ({
  forceCardMode,
}): ReactElement => {
  const { sidebarRendered } = useSidebarRendered();

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
            <FeedContainer>
              {queryResult?.data?.pages?.length > 0 &&
                queryResult.data.pages.map((page) => 
                  page.sources.edges.reduce(
                    (nodes, node) => {
                      nodes.push(
                        <SourcesCard source={node} />
                      );
                      return nodes;
                    },
                    [],
                  )
              )}
            </FeedContainer>
            
            {/* <p>LAST CARD</p> */}
          </>
        </InfiniteScrolling>
      </BaseFeedPage>
    </>
  );
};

const SourcesCard = (props: any) => {
  const { name, handle, image, description, membersCount, members }: SourceProps = props.source.node;
  const { user } = useContext(AuthContext);
  const isMember = members?.edges.find((member) => member?.node?.user.id === user.id);
  const items = members?.edges.reduce((acc, current) => {
    acc.push(current.node);
    return acc;
  }, []);
  
  return (
    <Card className='p-0'>
      <div className='h-24 px-4 bg-theme-bg-onion rounded-t-2xl'>
      </div>
      <div className='-mt-12 p-4 bg-theme-bg-secondary rounded-t-2xl'>
        <div className='flex items-end justify-between mb-3'>
          <img className='-mt-14 w-24 h-24 rounded-full z-10' src={image} />
          {membersCount > 0 && (
            <SquadMemberShortList
              squad={props.source?.node}
              members={items}
              memberCount={membersCount}
            />
          )}
        </div>
        <div className='typo-title3 font-bold'>{name}</div>
        <div className='mb-2 text-theme-color-salt'>@{handle}</div>
        <div className='mb-2 text-theme-color-salt multi-truncate line-clamp-3'>{description}</div>
        <Button
          tag="a"
          href='#'
          className="btn-secondary"
        >
          {isMember ? 'View squad' : 'Join'}
        </Button>
      </div>
    </Card>
  )
}

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = mainFeedLayoutProps;

export default SquadsPage;
