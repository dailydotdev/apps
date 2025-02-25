import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import type { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import type { ClientError } from 'graphql-request';
import { SCROLL_OFFSET } from '@dailydotdev/shared/src/components/post/PostContent';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import classNames from 'classnames';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth/useOnboarding';
import {
  useJoinReferral,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getLayout } from '../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../components/layouts/FooterNavBarLayout';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../../components/common';

const Unauthorized = dynamic(
  () =>
    import(
      /* webpackChunkName: "unauthorized" */ '@dailydotdev/shared/src/components/errors/Unauthorized'
    ),
);
const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);

const PostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyPostContent" */ '@dailydotdev/shared/src/components/post/PostContent'
  ).then((module) => module.PostContent),
);

const SquadPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazySquadPostContent" */ '@dailydotdev/shared/src/components/post/SquadPostContent'
  ).then((module) => module.SquadPostContent),
);

const CollectionPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyCollectionPostContent" */ '@dailydotdev/shared/src/components/post/collection'
  ).then((module) => module.CollectionPostContent),
);

const PostAuthBanner = dynamic(() =>
  import(
    /* webpackChunkName: "postAuthBanner" */ '@dailydotdev/shared/src/components/auth/PostAuthBanner'
  ).then((module) => module.PostAuthBanner),
);

export interface Props extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  error?: ApiError;
}

const CONTENT_MAP: Record<PostType, typeof PostContent> = {
  article: PostContent,
  share: SquadPostContent,
  welcome: SquadPostContent,
  freeform: SquadPostContent,
  [PostType.VideoYouTube]: PostContent,
  collection: CollectionPostContent,
};

export interface PostParams extends ParsedUrlQuery {
  id: string;
}

export const seoTitle = (post: Post): string | undefined => {
  if (post?.type === PostType.Share && post?.title === null) {
    return `Shared post at ${post?.source?.name}`;
  }

  return post?.title;
};

export const PostPage = ({ id, initialData, error }: Props): ReactElement => {
  useJoinReferral();
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const { isFallback } = router;
  const { shouldShowAuthBanner } = useOnboarding();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { post, isError, isLoading } = usePostById({
    id,
    options: {
      initialData,
      retry: false,
    },
  });
  const featureTheme = useFeatureTheme();
  const containerClass = classNames(
    'mb-16 min-h-page max-w-screen-laptop tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
    [PostType.Share, PostType.Welcome, PostType.Freeform].includes(post?.type),
    featureTheme && 'bg-transparent',
  );

  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET,
    scrollProperty: 'scrollY',
  });

  const privateSourceJoin = usePrivateSourceJoin({ postId: id });

  if (isLoading || isFallback || privateSourceJoin.isActive) {
    return (
      <>
        <PostSEOSchema post={post} />
        <PostLoadingSkeleton className={containerClass} type={post?.type} />
      </>
    );
  }

  const Content = CONTENT_MAP[post?.type];

  if (!Content || isError) {
    if (error === ApiError.Forbidden) {
      return <Unauthorized />;
    }
    return <Custom404 />;
  }

  return (
    <FooterNavBarLayout post={post}>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      <PostSEOSchema post={post} />
      <Content
        position={position}
        isPostPage
        post={post}
        isFallback={isFallback}
        backToSquad={!!router?.query?.squad}
        shouldOnboardAuthor={!!router.query?.author}
        origin={Origin.ArticlePage}
        isBannerVisible={shouldShowAuthBanner && !isLaptop}
        className={{
          container: containerClass,
          fixedNavigation: { container: 'flex laptop:hidden' },
          navigation: {
            container: 'flex tablet:hidden',
            actions: 'flex-1 justify-between',
          },
          content: 'laptop:pt-8',
        }}
      />
      {shouldShowAuthBanner && isLaptop && <PostAuthBanner />}
    </FooterNavBarLayout>
  );
};

PostPage.getLayout = getLayout;
PostPage.layoutProps = {
  screenCentered: false,
  customBanner: <CustomAuthBanner />,
};

export default PostPage;

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
      noindex: post?.author ? post.author.reputation <= 10 : false,
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
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errorCode = clientError?.response?.errors?.[0]?.extensions?.code;
    const errors = Object.values(ApiError);
    if (errors.includes(errorCode)) {
      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id, error: errorCode },
        revalidate: 60,
      };
    }
    throw err;
  }
}
