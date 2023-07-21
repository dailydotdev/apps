import React, { ReactElement, useContext } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { SOURCES_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeedContainer,
  SourceCard,
  SquadListingHeader,
} from '@dailydotdev/shared/src/components';
import EditIcon from '@dailydotdev/shared/src/components/icons/Edit';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import FeedLayout, { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { SquadsPublicSuggestion } from '@dailydotdev/shared/src/lib/constants';

const seo: NextSeoProps = {
  title: `Squad directory | daily.dev`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const SquadsPage = (): ReactElement => {
  const { sidebarRendered } = useSidebarRendered();
  const { user } = useContext(AuthContext);

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

      <FeedLayout>
        <BaseFeedPage className="relative pt-2 laptop:pt-8 mb-4">
          <InfiniteScrolling
            isFetchingNextPage={queryResult.isFetchingNextPage}
            canFetchMore={checkFetchMore(queryResult)}
            fetchNextPage={queryResult.fetchNextPage}
            className="w-full"
          >
            <FeedContainer header={<SquadListingHeader />} className="px-6 laptop:px-0">
              {queryResult?.data?.pages?.length > 0 &&
                queryResult.data.pages.map((page) =>
                  page.sources.edges.reduce(
                    (nodes, { node: { name, permalink, id, ...props } }) => {
                      const isMember =
                        user &&
                        props?.members?.edges.find(
                          (member) => member?.node?.user.id === user.id,
                        );
                      const action = !isMember ? {
                        text: 'Join',
                        onClick: () => alert(`Join ${name}`)
                      } : undefined;
                      const link = isMember ? {
                        text: 'View squad',
                        href: permalink
                      } : undefined

                      nodes.push(
                        <SourceCard
                          title={name}
                          subtitle={`@${props.handle}`}
                          action={action}
                          link={link}
                          permalink={permalink}
                          id={id}
                          {...props}
                        />,
                      );
                      return nodes;
                    },
                    [],
                  ),
                )}
              <SourceCard
                title="Which squads would you like to see next?"
                description="We're thrilled to see how our community has grown and evolved, thanks to your incredible support. Let your voice be heard and be part of the decision-making process."
                link={{
                  text: 'Submit your idea',
                  href: SquadsPublicSuggestion,
                  target: '_blank',
                }}
                icon={
                  <EditIcon
                    size={IconSize.XXLarge}
                    className="text-theme-label-secondary"
                  />
                }
              />
            </FeedContainer>
          </InfiniteScrolling>
        </BaseFeedPage>
      </FeedLayout>
    </>
  );
};

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = mainFeedLayoutProps;

export default SquadsPage;
