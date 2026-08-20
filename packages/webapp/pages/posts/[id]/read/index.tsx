import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo/lib/types';
import type { ClientError } from 'graphql-request';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import { POST_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import type {
  Comment,
  TopCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { TOP_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { ArbitragePostContent } from '@dailydotdev/shared/src/components/post/arbitrage/ArbitragePostContent';
import { ArbitrageAnchor } from '@dailydotdev/shared/src/components/post/arbitrage/ArbitrageAnchor';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../../../components/common';
import { noindexSeoProps } from '../../../../next-seo';
import { getPostCanonicalUrl } from '../../../../lib/seo';
import type { PostParams } from '../index';
import { seoTitle } from '../index';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../404'),
);

export interface ArbitragePostPageProps extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  topComments?: Comment[];
  error?: ApiError;
}

/**
 * Ad-monetised post template for paid-acquisition and organic landing traffic.
 *
 * Lives on its own route so `/posts/[id]` and the focus-card redesign are
 * untouched. Differences from the standard template, all deliberate: no
 * PostAuthBanner, no CustomAuthBanner (never passed in layoutProps), no
 * PostSignupWidget, and the sidebar is forced open to carry slot 1. The header
 * login/signup buttons are unaffected and render as usual.
 *
 * Noindexed for now — it duplicates `/posts/[id]`, so it must not compete in
 * search until we decide it is the canonical version for organic traffic.
 */
const ArbitragePostPage = ({
  id,
  initialData,
  topComments,
  error,
}: ArbitragePostPageProps): ReactElement => {
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });

  if (isLoading) {
    return <PostLoadingSkeleton type={post?.type} />;
  }

  if (isError || error || !post) {
    return <Custom404 />;
  }

  return (
    <ActivePostContextProvider post={post}>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      <PostSEOSchema post={post} topComments={topComments} />
      <ArbitragePostContent
        post={post}
        // pb-28 keeps the last slot clear of the fixed anchor (slot 13).
        className="min-h-page max-w-[69.25rem] pb-28"
      />
      <ArbitrageAnchor />
    </ActivePostContextProvider>
  );
};

ArbitragePostPage.getLayout = getLayout;
ArbitragePostPage.layoutProps = {
  screenCentered: false,
  expandSidebar: true,
  hideFeedbackWidget: true,
  // No customBanner on purpose: that is what mounts CustomAuthBanner.
};

export default ArbitragePostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<
  GetStaticPropsResult<ArbitragePostPageProps>
> {
  if (!params?.id) {
    return { notFound: true, revalidate: 60 };
  }

  const { id } = params;

  try {
    const [initialData, commentsData] = await Promise.all([
      gqlClient.request<PostData>(POST_BY_ID_STATIC_FIELDS_QUERY, { id }),
      gqlClient
        .request<TopCommentsData>(TOP_COMMENTS_QUERY, { postId: id, first: 5 })
        .catch(() => ({ topComments: [] })),
    ]);

    const post = initialData.post as Post;
    const pageSeoTitles = getPageSeoTitles(seoTitle(post) ?? '');
    const seo: NextSeoProps = {
      canonical: post?.slug ? getPostCanonicalUrl(post.slug) : undefined,
      title: pageSeoTitles.title,
      description: getSeoDescription(post),
      ...noindexSeoProps,
    };

    return {
      props: {
        id: initialData.post.id,
        initialData,
        topComments: commentsData.topComments || [],
        seo,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const responseErrors = clientError?.response?.errors;
    const errorCode = responseErrors?.[0]?.extensions?.code;

    if (errorCode === ApiError.NotFound) {
      return { notFound: true };
    }

    if (Object.values(ApiError).includes(errorCode)) {
      const { postId } = responseErrors?.[0]?.extensions ?? {};
      return {
        props: {
          id: postId || id,
          error: errorCode,
          seo: { ...noindexSeoProps },
        },
        revalidate: 60,
      };
    }

    throw err;
  }
}
