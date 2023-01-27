import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { NextSeo } from 'next-seo';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  Post,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  PostContent,
  SCROLL_OFFSET,
} from '@dailydotdev/shared/src/components/post/PostContent';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import SquadPostContent from '@dailydotdev/shared/src/components/post/SquadPostContent';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

const Custom404 = dynamic(() => import(/* webpackChunkName: "404" */ '../404'));

export const getSeoDescription = (post: Post): string => {
  if (post?.summary) {
    return post?.summary;
  }
  if (post?.description) {
    return post?.description;
  }
  return `Join us to the discussion about "${post?.title}" on daily.dev ✌️`;
};
export interface Props {
  id: string;
  postData?: PostData;
}

const CONTENT_MAP: Record<PostType, typeof PostContent> = {
  article: PostContent,
  share: SquadPostContent,
};

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ id, postData }: Props): ReactElement => {
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const { isFallback } = router;

  if (!isFallback && !id) return <Custom404 />;

  const { post, isLoading } = usePostById({
    id,
    options: { initialData: postData },
  });

  const seo: NextSeoProps = {
    title: getTemplatedTitle(postData?.post.title),
    description: getSeoDescription(postData?.post),
    openGraph: {
      images: [{ url: postData?.post.image }],
      article: {
        publishedTime: postData?.post.createdAt,
        tags: postData?.post.tags,
      },
    },
  };
  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET,
    scrollProperty: 'scrollY',
  });

  useEffect(() => {
    globalThis.window?.addEventListener('popstate', () => {
      router.reload();
    });
  }, []);

  const Content = CONTENT_MAP[post?.type];

  if (!Content) return <Custom404 />;

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      <NextSeo {...seo} />
      <Content
        position={position}
        post={post}
        isFallback={isFallback}
        isLoading={isLoading}
        shouldOnboardAuthor={!!router.query?.author}
        enableShowShareNewComment={!!router?.query.new}
        origin={Origin.ArticlePage}
        className={{
          onboarding: 'mb-8',
          container: 'pb-20 laptop:pb-6 laptopL:pb-0 max-w-screen-laptop',
          fixedNavigation: { container: 'flex laptop:hidden' },
          navigation: {
            container: 'tablet:hidden',
            actions: 'justify-between w-full',
          },
        }}
      />
    </>
  );
};

PostPage.getLayout = getMainLayout;
PostPage.layoutProps = { screenCentered: false };

export default PostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  const { id } = params;
  try {
    const postData = await request<PostData>(
      `${apiUrl}/graphql`,
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    return {
      props: {
        id,
        postData,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'NOT_FOUND') {
      return {
        props: { id: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
