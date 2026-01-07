import React from 'react';
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import { POST_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { TopCommentsData } from '@dailydotdev/shared/src/graphql/comments';
import { TOP_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import type { ClientError } from 'graphql-request';
import type { NextSeoProps } from 'next-seo';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useUserShortByIdQuery } from '@dailydotdev/shared/src/hooks/user/useUserShortByIdQuery';
import { USER_SHORT_BY_ID } from '@dailydotdev/shared/src/graphql/users';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getSeoDescription } from '../../../../components/PostSEOSchema';
import type { Props } from '../index';
import { PostPage, seoTitle } from '../index';
import { getLayout } from '../../../../components/layouts/MainLayout';

export type SharePostPageProps = Props & {
  shareUserId?: string;
  shareUser?: PublicProfile;
};

const SharePostPage = ({
  shareUserId,
  shareUser,
  ...props
}: SharePostPageProps): ReactElement => {
  useUserShortByIdQuery({ id: shareUserId, initialData: shareUser });

  return <PostPage {...props} />;
};

export const getServerSideProps: GetServerSideProps<
  SharePostPageProps | { redirect: { destination: string } }
> = async ({ params, res, query }) => {
  const { id } = params;
  try {
    const promises: [
      Promise<PostData>,
      Promise<PublicProfile | undefined>,
      Promise<TopCommentsData>,
    ] = [
      gqlClient.request<PostData>(POST_BY_ID_STATIC_FIELDS_QUERY, { id }),
      query.userid
        ? gqlClient
            .request(USER_SHORT_BY_ID, {
              id: query.userid as string,
            })
            .then((data) => data.user)
            .catch(() => undefined)
        : Promise.resolve(undefined),
      gqlClient
        .request<TopCommentsData>(TOP_COMMENTS_QUERY, { postId: id, first: 5 })
        .catch(() => ({ topComments: [] })),
    ];

    const [initialData, shareUser, commentsData] = await Promise.all(promises);
    const topComments = commentsData.topComments || [];

    if (shareUser && query.userid !== shareUser.id) {
      const { id: queryId, userid, ...restQuery } = query;

      return {
        redirect: {
          destination: getPathnameWithQuery(
            `/posts/${id}`,
            new URLSearchParams(restQuery as Record<string, string>),
          ),
        },
        props: { id: initialData.post.id },
      };
    }

    const post = initialData.post as Post;
    const seo: NextSeoProps = {
      canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
      title: getTemplatedTitle(seoTitle(post)),
      description: getSeoDescription(post),
      openGraph: {
        images: [
          {
            url: `https://og.daily.dev/api/posts/${post?.id}?userid=${shareUser.id}`,
            width: 1200,
            height: 630,
            alt: post?.title || 'Post cover image',
          },
        ],
        article: {
          publishedTime: post?.createdAt,
          modifiedTime: post?.updatedAt,
          tags: post?.tags,
          authors: post?.author?.permalink
            ? [post.author.permalink]
            : undefined,
        },
        locale: post?.language || 'en',
      },
      additionalMetaTags: [
        {
          name: 'robots',
          content: 'max-image-preview:large',
        },
      ],
    };

    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneHour}`,
    );

    return {
      props: {
        id: initialData.post.id,
        initialData,
        seo,
        shareUser: shareUser || null,
        shareUserId: shareUser ? (query.userid as string) : null,
        topComments,
      },
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errorCode = clientError?.response?.errors?.[0]?.extensions?.code;
    const errors = Object.values(ApiError);
    if (errors.includes(errorCode)) {
      // Return proper 404 for not found posts (better for SEO/crawl budget)
      if (errorCode === ApiError.NotFound) {
        return {
          notFound: true,
        };
      }

      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id },
      };
    }
    throw err;
  }
};

SharePostPage.getLayout = getLayout;
SharePostPage.layoutProps = {
  screenCentered: false,
  customBanner: <CustomAuthBanner />,
};

export default SharePostPage;
