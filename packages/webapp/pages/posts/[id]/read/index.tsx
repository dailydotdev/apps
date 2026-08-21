import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
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
import { ADSENSE_SCRIPT_SRC } from '@dailydotdev/shared/src/components/post/arbitrage/adsense';
import { useReadAdsenseSlots } from '@dailydotdev/shared/src/components/post/arbitrage/useReadAdsenseSlots';
import { AdsenseHeadHints } from '../../../../components/AdsenseHeadHints';
import { getLayout } from '../../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../../components/layouts/FooterNavBarLayout';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../../../components/common';
import { noindexSeoProps } from '../../../../next-seo';
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
  const router = useRouter();
  const adsenseSlots = useReadAdsenseSlots();
  const adsLive = Object.keys(adsenseSlots).length > 0;
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });

  // adsbygoogle must never follow a client-side navigation into the rest of
  // the app: once loaded, its Auto ads overlays (anchor/vignette) persist
  // across soft navigations. Leaving /read forces a full page load, which
  // tears down every Google global — combined with the script only ever being
  // rendered by this route, ads outside /read are impossible by construction.
  useEffect(() => {
    if (!adsLive) {
      return undefined;
    }
    const forceHardNavigation = (url: string): void => {
      if (/^\/posts\/[^/]+\/read(?:[/?#]|$)/.test(url)) {
        return;
      }
      router.events.emit('routeChangeError');
      window.location.assign(url);
      // Next.js has no cancel API; throwing inside the handler is the
      // established way to abort the client-side transition.
      throw new Error(`Aborted client navigation to ${url} to unload ads`);
    };
    router.events.on('routeChangeStart', forceHardNavigation);
    return () => router.events.off('routeChangeStart', forceHardNavigation);
  }, [adsLive, router]);

  if (isLoading) {
    return <PostLoadingSkeleton type={post?.type} />;
  }

  if (isError || error || !post) {
    return <Custom404 />;
  }

  return (
    <ActivePostContextProvider post={post}>
      {/* Below laptop MainLayoutHeader renders the feed nav, which a post route
          has nothing to fill, so without this the page carries no navigation at
          all on a phone — the single clearest doorway-page signal there is. The
          post is deliberately not passed: that would add the mobile floating
          comment bar, a third fixed element competing with the footer nav and
          the anchor for the bottom of a phone screen. */}
      <FooterNavBarLayout>
        <Head>
          <link rel="preload" as="image" href={post?.image} />
        </Head>
        {adsLive && (
          <>
            <AdsenseHeadHints />
            <Script
              id="adsbygoogle-loader"
              src={ADSENSE_SCRIPT_SRC}
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          </>
        )}
        <PostSEOSchema post={post} topComments={topComments} />
        <ArbitragePostContent
          post={post}
          // 72rem, wider than the standard template's 69.25rem: the main column
          // has to clear 728px for a leaderboard to render at its full size, and
          // at 69.25rem it only had 704px. 1152 - 340 rail - 64 padding = 748px.
          className="min-h-page max-w-[72rem] pb-[calc(7rem_+_var(--arbitrage-anchor-height,0px))]"
        />
        <ArbitrageAnchor />
      </FooterNavBarLayout>
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
    // noindex only, deliberately without a canonical to the parent post:
    // canonical asks Google to consolidate while noindex asks it to drop the
    // page — mixed signals Google warns against. This page must simply never
    // rank, so it sends the one unambiguous directive.
    const seo: NextSeoProps = {
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
