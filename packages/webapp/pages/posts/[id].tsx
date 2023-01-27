import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { NextSeo } from 'next-seo';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  POST_BY_ID_QUERY,
  PostData,
  Post,
} from '@dailydotdev/shared/src/graphql/posts';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  PostContent,
  SCROLL_OFFSET,
} from '@dailydotdev/shared/src/components/post/PostContent';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
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
  initialData?: PostData;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ id, initialData }: Props): ReactElement => {
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const { tokenRefreshed } = useContext(AuthContext);
  const router = useRouter();
  const { isFallback } = router;

  const {
    data: fetchedPost,
    isLoading,
    isFetched,
  } = useQuery<PostData>(
    ['post', id],
    () => request(`${apiUrl}/graphql`, POST_BY_ID_QUERY, { id }),
    { initialData, enabled: !!id && tokenRefreshed },
  );

  // Need this as sometimes client side might still be loading, but we already have initial data.
  const post = fetchedPost ?? initialData;

  if ((!isFallback && !id) || (isFetched && !post.post.id)) {
    return <Custom404 />;
  }

  const seo: NextSeoProps = {
    title: getTemplatedTitle(post?.post.title),
    description: getSeoDescription(post?.post),
    openGraph: {
      images: [{ url: post?.post.image }],
      article: {
        publishedTime: post?.post.createdAt,
        tags: post?.post.tags,
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
    window.addEventListener('popstate', () => {
      router.reload();
    });
  }, []);

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={post?.post.image} />
      </Head>
      <NextSeo {...seo} />
      <PostContent
        position={position}
        postById={post}
        isFallback={isFallback}
        isLoading={isLoading || !isFetched}
        enableAuthorOnboarding={!!router.query?.author}
        enableShowShareNewComment={!!router?.query.new}
        className={{
          container: 'pb-20 laptop:pb-6 laptopL:pb-0',
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
    const initialData = await request<PostData>(
      `${apiUrl}/graphql`,
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    return {
      props: {
        id,
        initialData,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'NOT_FOUND') {
      return {
        props: { id },
        revalidate: 60,
      };
    }
    throw err;
  }
}
