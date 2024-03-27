import React, {
  CSSProperties,
  ReactElement,
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
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { ONBOARDING_OFFSET } from '@dailydotdev/shared/src/components/post/BasePostContent';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import classNames from 'classnames';
import { CollectionPostContent } from '@dailydotdev/shared/src/components/post/collection';
import {
  AuthenticationBanner,
  authGradientBg,
} from '@dailydotdev/shared/src/components/auth';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth/useOnboarding';
import {
  useJoinReferral,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import LoginButton from '@dailydotdev/shared/src/components/LoginButton';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { getLayout } from '../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../components/layouts/FooterNavBarLayout';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../components/PostSEOSchema';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);

const CustomPostBanner = () => {
  const { shouldShowAuthBanner } = useOnboarding();
  const { shouldShowLogin } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isValid =
    shouldShowAuthBanner && !isLaptop && (isTablet || !shouldShowLogin);

  if (!isValid) {
    return null;
  }

  return (
    <LoginButton
      className={{
        container: classNames(
          authGradientBg,
          'sticky left-0 top-0 z-max w-full justify-center gap-2 border-b border-theme-color-cabbage px-4 py-2',
        ),
        button: 'flex-1 tablet:max-w-[9rem]',
      }}
    />
  );
};

export interface Props {
  id: string;
  initialData?: PostData;
}

const CONTENT_MAP: Record<PostType, typeof PostContent> = {
  article: PostContent,
  share: SquadPostContent,
  welcome: SquadPostContent,
  freeform: SquadPostContent,
  [PostType.VideoYouTube]: PostContent,
  collection: CollectionPostContent,
};

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ id, initialData }: Props): ReactElement => {
  useJoinReferral();
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const { isFallback } = router;
  const { shouldShowAuthBanner } = useOnboarding();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });
  const containerClass = classNames(
    'mb-16 max-w-screen-laptop tablet:mb-8 laptop:mb-0 laptop:min-h-page laptop:pb-6 laptopL:pb-0',
    [PostType.Share, PostType.Welcome, PostType.Freeform].includes(post?.type),
  );
  const seoTitle = () => {
    if (post?.type === PostType.Share && post?.title === null) {
      return `Shared post at ${post?.source?.name}`;
    }

    return post?.title;
  };
  const seo: NextSeoProps = {
    title: getTemplatedTitle(seoTitle()),
    description: getSeoDescription(post),
    openGraph: {
      images: [{ url: `https://og.daily.dev/api/posts/${post?.id}` }],
      article: {
        publishedTime: post?.createdAt,
        tags: post?.tags,
      },
    },
  };

  const seoComponent = <NextSeo {...seo} />;

  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET + (showArticleOnboarding ? ONBOARDING_OFFSET : 0),
    scrollProperty: 'scrollY',
  });

  if (isLoading || isFallback) {
    return (
      <>
        <PostSEOSchema post={post} />
        {post?.title?.length && seoComponent}
        <PostLoadingSkeleton className={containerClass} type={post?.type} />
      </>
    );
  }

  const Content = CONTENT_MAP[post?.type];

  if (!Content || isError) {
    return <Custom404 />;
  }

  return (
    <FooterNavBarLayout post={post}>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      {seoComponent}
      <PostSEOSchema post={post} />
      <Content
        position={position}
        isPostPage
        post={post}
        isFallback={isFallback}
        backToSquad={!!router?.query?.squad}
        shouldOnboardAuthor={!!router.query?.author}
        enableShowShareNewComment={!!router?.query.new}
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
      {shouldShowAuthBanner && isLaptop && <AuthenticationBanner />}
    </FooterNavBarLayout>
  );
};

PostPage.getLayout = getLayout;
PostPage.layoutProps = {
  screenCentered: false,
  customBanner: <CustomPostBanner />,
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
