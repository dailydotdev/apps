import React, { ReactElement, useContext, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { SIMILAR_POSTS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedPageHeader } from '@dailydotdev/shared/src/components/utilities';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import Custom404 from '../../404';

export interface Props {
  id: string;
  initialData?: PostData;
}

const SimilarFeed = ({ id, initialData }: Props): ReactElement => {
  const { user } = useContext(AuthContext);
  const { post, isError } = usePostById({
    id,
    options: { initialData, retry: false },
  });
  const { FeedPageLayoutComponent } = useFeedLayout();
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      postId: id,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
    }),
    [id],
  );

  const seo: NextSeoProps = {
    title: `similar posts to ${post?.title} on daily.dev`,
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  if (isError) {
    return <Custom404 />;
  }

  return (
    <FeedPageLayoutComponent className="overflow-x-hidden">
      <NextSeo {...seo} />
      <FeedPageHeader className="mb-5">
        <h1 className="font-bold typo-callout">
          Posts similar to &quot;{post?.title}&quot;
        </h1>
      </FeedPageHeader>
      <Feed
        feedName={OtherFeedPage.SimilarPosts}
        feedQueryKey={[
          'similarPostsFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={id && SIMILAR_POSTS_FEED_QUERY}
        variables={queryVariables}
      />
    </FeedPageLayoutComponent>
  );
};

SimilarFeed.getLayout = getLayout;
SimilarFeed.layoutProps = mainFeedLayoutProps;

export default SimilarFeed;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const { id } = params;
  try {
    const initialData = await request<PostData>(
      graphqlUrl,
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    return {
      props: {
        id: initialData.post.id,
        initialData,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);
    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id },
        revalidate: 60,
      };
    }
    throw err;
  }
}
