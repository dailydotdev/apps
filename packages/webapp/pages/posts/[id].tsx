import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQueryClient } from 'react-query';
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
} from '@dailydotdev/shared/src/graphql/posts';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const Custom404 = dynamic(() => import('../404'));

export interface Props {
  id: string;
  postData?: PostData;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ id, postData }: Props): ReactElement => {
  const router = useRouter();
  const { isFallback } = router;

  if (!isFallback && !id) {
    return <Custom404 />;
  }

  const client = useQueryClient();
  const postById = client.getQueryData(['post', id]) as Post;

  const seo: NextSeoProps = {
    title: postById?.title,
    titleTemplate: '%s | daily.dev',
    description:
      postById?.description?.length > 0
        ? postById?.description
        : `Join us to the discussion about "${postById?.title}" on daily.dev ✌️`,
    openGraph: {
      images: [{ url: postById?.image }],
      article: {
        publishedTime: postById?.createdAt,
        tags: postById?.tags,
      },
    },
  };

  const setContent = (
    <>
      <Head>
        <link rel="preload" as="image" href={postById?.image} />
      </Head>
      <NextSeo {...seo} />
    </>
  );

  return (
    <PostContent
      id={id}
      postData={postData}
      seo={setContent}
      isFallback={isFallback}
      enableAuthorOnboarding={!!router.query?.author}
      enableShowShareNewComment={!!router?.query.new}
      className="pt-6 pb-20 laptop:pb-6 laptopL:pb-0"
    />
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
