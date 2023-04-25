import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
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
  Post,
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  PostContent,
  SCROLL_OFFSET,
} from '@dailydotdev/shared/src/components/post/PostContent';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import SquadPostContent from '@dailydotdev/shared/src/components/post/SquadPostContent';
import SquadPostPageNavigation from '@dailydotdev/shared/src/components/post/SquadPostPageNavigation';
import useWindowEvents from '@dailydotdev/shared/src/hooks/useWindowEvents';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { ONBOARDING_OFFSET } from '@dailydotdev/shared/src/components/post/BasePostContent';
import { modalSizeToClassName } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import classNames from 'classnames';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

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

const CONTENT_MAP: Record<PostType, typeof PostContent> = {
  article: PostContent,
  share: SquadPostContent,
};

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const CHECK_POPSTATE = 'popstate_key';

const PostPage = ({ id, initialData }: Props): ReactElement => {
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const { sidebarRendered } = useSidebarRendered();
  const { isFallback } = router;
  useWindowEvents(
    'popstate',
    CHECK_POPSTATE,
    useCallback(() => router.reload(), []),
    false,
  );

  const { post, isError, isFetched, isPostLoadingOrFetching } = usePostById({
    id,
    options: { initialData, retry: false },
  });
  const containerClass = classNames(
    'pb-20 laptop:pb-6 laptopL:pb-0 max-w-screen-laptop border-r laptop:min-h-page',
    post?.type === PostType.Share &&
      sidebarRendered &&
      modalSizeToClassName[ModalSize.Large],
  );
  const seo: NextSeoProps = {
    title: getTemplatedTitle(post?.title),
    description: getSeoDescription(post),
    openGraph: {
      images: [{ url: post?.image }],
      article: {
        publishedTime: post?.createdAt,
        tags: post?.tags,
      },
    },
  };

  console.log(initialData, post);
  const seoComponent = <NextSeo {...seo} />;

  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET + (showArticleOnboarding ? ONBOARDING_OFFSET : 0),
    scrollProperty: 'scrollY',
  });

  if (isPostLoadingOrFetching || isFallback || !isFetched) {
    return (
      <>
        {post?.title?.length && seoComponent}
        <PostLoadingSkeleton className={containerClass} type={post?.type} />
      </>
    );
  }

  const Content = CONTENT_MAP[post?.type];
  const navigation: Record<PostType, ReactNode> = {
    article: null,
    share: !post?.source ? (
      <></>
    ) : (
      <SquadPostPageNavigation squadLink={post.source.permalink} />
    ),
  };
  const customNavigation = navigation[post?.type] ?? navigation.article;

  if (!Content || isError) return <Custom404 />;

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      {seoComponent}
      <Content
        position={position}
        post={post}
        isFallback={isFallback}
        customNavigation={customNavigation}
        shouldOnboardAuthor={!!router.query?.author}
        enableShowShareNewComment={!!router?.query.new}
        origin={Origin.ArticlePage}
        className={{
          container: containerClass,
          fixedNavigation: { container: 'flex laptop:hidden' },
          navigation: {
            container: 'flex tablet:hidden',
            actions: 'flex-1 justify-between',
          },
          content: 'pt-8',
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
      graphqlUrl,
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
    const errors = Object.values(ApiError);
    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      return {
        props: { id },
        revalidate: 60,
      };
    }
    throw err;
  }
}
