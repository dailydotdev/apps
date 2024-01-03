import React, { ReactElement, useContext } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import { SQUAD_DIRECTORY_SOURCES } from '@dailydotdev/shared/src/graphql/squads';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeedContainer,
  SourceCard,
  SourceCardBorderColor,
  SquadsDirectoryHeader,
} from '@dailydotdev/shared/src/components';
import EditIcon from '@dailydotdev/shared/src/components/icons/Edit';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { squadsPublicSuggestion } from '@dailydotdev/shared/src/lib/constants';
import { GetStaticPropsResult } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { Connection } from '@dailydotdev/shared/src/graphql/common';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
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
  const { user } = useContext(AuthContext);

  const queryResult = useInfiniteQuery(
    ['sourcesFeed'],
    ({ pageParam }) =>
      request(graphqlUrl, SQUAD_DIRECTORY_SOURCES, {
        filterOpenSquads: true,
        first: 100,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.sources?.pageInfo?.hasNextPage &&
        lastPage?.sources?.pageInfo?.endCursor,
      initialData,
    },
  );

  return (
    <>
      <NextSeo {...seo} />

      <FeedLayout>
        <BaseFeedPage className="relative mb-4 pt-2 laptop:pt-8">
          <InfiniteScrolling
            isFetchingNextPage={queryResult.isFetchingNextPage}
            canFetchMore={checkFetchMore(queryResult)}
            fetchNextPage={queryResult.fetchNextPage}
            className="w-full"
          >
            <FeedContainer
              header={<SquadsDirectoryHeader />}
              className="px-6"
              inlineHeader
              forceCardMode
            >
              {queryResult?.data?.pages?.length > 0 && (
                <>
                  {queryResult.data.pages.map((page) =>
                    page.sources.edges.reduce(
                      (nodes, { node: { name, permalink, id, ...props } }) => {
                        const isMember = user && props?.currentMember;

                        nodes.push(
                          <SourceCard
                            title={name}
                            subtitle={`@${props.handle}`}
                            action={{
                              text: isMember ? 'View Squad' : 'Join Squad',
                              type: isMember ? 'link' : 'action',
                              href: isMember ? permalink : undefined,
                            }}
                            source={{
                              name,
                              active: props.active,
                              description: props.description,
                              public: props.public,
                              membersCount: props.membersCount,
                              permalink,
                              id,
                              type: props.type,
                              handle: props.handle,
                              image: props.image,
                              memberInviteRole: props.memberInviteRole,
                              memberPostingRole: props.memberPostingRole,
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
                  <SourceCard
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
                        className="text-theme-label-tertiary"
                      />
                    }
                    description="We're thrilled to see how our community has grown and evolved, thanks to your incredible support. Let your voice be heard and be part of the decision-making process."
                    borderColor={SourceCardBorderColor.Pepper}
                  />
                </>
              )}
            </FeedContainer>
          </InfiniteScrolling>
        </BaseFeedPage>
      </FeedLayout>
    </>
  );
};

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = mainFeedLayoutProps;

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  try {
    const initialData = await request(graphqlUrl, SQUAD_DIRECTORY_SOURCES, {
      filterOpenSquads: true,
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
