import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  PostData,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  Post,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { ClientError } from 'graphql-request';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { NextSeoProps } from 'next-seo';
import { ApiError } from 'next/dist/server/api-utils';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement } from 'react';
import { DynamicSeoProps } from '../../../components/common';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getSeoDescription } from '../../../components/PostSEOSchema';

export interface Props extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
}

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const seoTitle = (post: Post) => {
  if (post?.type === PostType.Share && post?.title === null) {
    return `Shared post at ${post?.source?.name}`;
  }

  return post?.title;
};

const TestPage = ({ id, initialData }: Props): ReactElement => {
  return (
    <div>
      <h1>Test post: {id}</h1>
      <code>{JSON.stringify(initialData, null, 2)}</code>
    </div>
  );
};

export default TestPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  const { id } = params;

  try {
    const initialData = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );

    const post = initialData.post as Post;
    const seo: NextSeoProps = {
      canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
      title: getTemplatedTitle(seoTitle(post)),
      description: getSeoDescription(post),
      openGraph: {
        images: [{ url: `https://og.daily.dev/api/posts/${post?.id}` }],
        article: {
          publishedTime: post?.createdAt,
          tags: post?.tags,
        },
      },
    };

    return {
      props: {
        id: initialData.post.id,
        initialData,
        seo,
      },
      revalidate: 15,
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
