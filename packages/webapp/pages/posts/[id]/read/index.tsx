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
import { PostType } from '@dailydotdev/shared/src/types';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { ArbitragePostContent } from '@dailydotdev/shared/src/components/post/arbitrage/ArbitragePostContent';
import { ArbitrageAnchor } from '@dailydotdev/shared/src/components/post/arbitrage/ArbitrageAnchor';
import {
  ADSENSE_SCRIPT_SRC,
  hasLiveAdsenseUnits,
} from '@dailydotdev/shared/src/features/monetization/adsense';
import { useReadAdsenseSlots } from '@dailydotdev/shared/src/components/post/arbitrage/useReadAdsenseSlots';
import { AdsenseHeadHints } from '../../../../components/AdsenseHeadHints';
import { getLayout } from '../../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../../components/layouts/FooterNavBarLayout';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { getSeoDescription } from '../../../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../../../components/common';
import { noindexSeoProps } from '../../../../next-seo';
import type { PostParams } from '../index';
import { seoTitle } from '../index';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../404'),
);

const ARBITRAGE_ARTICLE_ROUTE_PATTERN =
  /^\/(?:articles\/[^/]+|posts\/[^/]+\/read)(?:[/?#]|$)/;

/**
 * The post types /articles may render, all of which carry content beyond the ad
 * slots. Deliberately excludes squad/user-generated types (share, welcome,
 * freeform, poll) — paid traffic never targets them and their content is our
 * members', not landing-page material — and internal types (brief, digest).
 */
const READ_ELIGIBLE_POST_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Collection,
]);

export interface ArbitragePostPageProps extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  error?: ApiError;
}

/**
 * Ad-monetised post template for paid-acquisition and organic landing traffic.
 *
 * Lives on its own route so `/posts/[id]` and the focus-card redesign are
 * untouched. Differences from the standard template, all deliberate: no
 * PostAuthBanner, no CustomAuthBanner (never passed in layoutProps), no
 * PostSignupWidget, and the sidebar starts expanded instead of at the stored
 * collapse preference (which the visitor can still toggle as usual). The
 * header login/signup buttons are unaffected and render as usual.
 *
 * Noindexed because it duplicates `/posts/[id]` and exists for paid/ad
 * traffic, not search discovery. Forces light mode while mounted: the ad
 * partner's creatives are designed against light pages.
 */
const ArbitragePostPage = ({
  id,
  initialData,
  error,
}: ArbitragePostPageProps): ReactElement => {
  const router = useRouter();
  const { applyThemeMode } = useSettingsContext();
  const adsenseSlots = useReadAdsenseSlots();
  const adsLive = hasLiveAdsenseUnits(adsenseSlots);
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });

  // Display-only override; the stored theme preference is untouched and
  // restored the moment the visitor leaves.
  useEffect(() => {
    applyThemeMode(ThemeMode.Light);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  // adsbygoogle must never follow a client-side navigation into the rest of
  // the app: once loaded, its Auto ads overlays (anchor/vignette) persist
  // across soft navigations. Leaving the article ad route forces a full page
  // load, which tears down every Google global — combined with the script only
  // ever being rendered by this route, ads outside it are impossible by
  // construction.
  useEffect(() => {
    if (!adsLive) {
      return undefined;
    }
    const forceHardNavigation = (
      url: string,
      { shallow }: { shallow: boolean },
    ): void => {
      // Shallow same-page updates (comment permalinks, URL-masking modals,
      // query tweaks) never unload anything — only a genuine departure from
      // the article ad route has ads to tear down.
      if (shallow || ARBITRAGE_ARTICLE_ROUTE_PATTERN.test(url)) {
        return;
      }
      router.events.emit('routeChangeError');
      window.location.assign(url);
      // Next.js has no cancel API; throwing inside the handler is the
      // established way to abort the client-side transition.
      throw new Error(`Aborted client navigation to ${url} to unload ads`);
    };
    router.events.on('routeChangeStart', forceHardNavigation);
    // Back/forward must not go through the handler above: on popstate the
    // history pointer has already moved, so assign() would navigate *forward*
    // and leave /read in the forward stack — Back appears broken. Cancelling
    // the SPA transition and loading the target URL in place respects the
    // history position the user just moved to.
    router.beforePopState(({ as }) => {
      if (ARBITRAGE_ARTICLE_ROUTE_PATTERN.test(as)) {
        return true;
      }
      window.location.href = as;
      return false;
    });
    return () => {
      router.events.off('routeChangeStart', forceHardNavigation);
      router.beforePopState(() => true);
    };
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
      <FooterNavBarLayout offsetByAnchorAd>
        <Head>
          {!!post.image && <link rel="preload" as="image" href={post.image} />}
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
        <ArbitragePostContent
          post={post}
          // 72rem, wider than the standard template's 69.25rem: the main column
          // has to clear 728px for a leaderboard to render at its full size, and
          // at 69.25rem it only had 704px. 1152 - 340 rail - 64 padding = 748px.
          // The floating leaderboard is an overlay: it reserves nothing here,
          // the way the top leaderboard takes no space beyond its own. This
          // used to add 7rem plus the ad's height, which double-counted the
          // mobile footer nav that FooterNavBarLayout already spaces for and
          // left the page ending in dead space.
          className="min-h-page max-w-[72rem] pb-6"
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
    // No comments prefetch and no JSON-LD: the page is noindexed, so
    // structured data serves nothing, and the thread hydrates client-side.
    const initialData = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );

    const post = initialData.post as Post;

    // AdSense's low-value-content policy targets pages that are ads around
    // scraped material, and enforcement is account-level — so the template is
    // only generated where the page carries substance of its own: an article
    // or video with a TLDR, or content types whose body we host. Everything
    // else 404s rather than rendering a title-plus-ads shell.
    const isReadEligible =
      READ_ELIGIBLE_POST_TYPES.has(post.type) &&
      !!(post.summary || post.contentHtml);
    if (!isReadEligible) {
      return { notFound: true, revalidate: 60 };
    }

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
