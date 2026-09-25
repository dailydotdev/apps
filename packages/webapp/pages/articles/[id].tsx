import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo } from 'react';
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
import { ReadPostContent } from '@dailydotdev/shared/src/components/post/read/ReadPostContent';
import type { PostFocusCardAds } from '@dailydotdev/shared/src/components/post/focus/PostFocusCard';
import { PostFocusCard } from '@dailydotdev/shared/src/components/post/focus/PostFocusCard';
import {
  ReadAdFormat,
  ReadAdSlot,
} from '@dailydotdev/shared/src/components/post/read/ReadAdSlot';
import { ReadTopLeaderboard } from '@dailydotdev/shared/src/components/post/read/ReadTopLeaderboard';
import Markdown from '@dailydotdev/shared/src/components/Markdown';
import {
  COMMENTS_PER_INTERLEAVED_AD,
  CONTENT_CHARS_PER_AD,
  MAX_CONTENT_ADS_PER_SECTION,
  READ_SLOT,
} from '@dailydotdev/shared/src/components/post/read/slots';
import {
  splitContentForAds,
  splitTextForAds,
} from '@dailydotdev/shared/src/components/post/read/splitContentForAds';
import { usePostRedesign } from '@dailydotdev/shared/src/hooks/post/usePostRedesign';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  hasLiveAdSlots,
  PREBID_SCRIPT_SRC,
} from '@dailydotdev/shared/src/features/monetization/kueez';
import {
  useArticlesContained,
  useReadAdSlots,
  useReadTaboola,
} from '@dailydotdev/shared/src/components/post/read/useReadAdSlots';
import { ReadNextArticles } from '@dailydotdev/shared/src/components/post/read/ReadNextArticles';
import { READ_ELIGIBLE_POST_TYPES } from '@dailydotdev/shared/src/components/post/read/common';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { ReadTaboolaSlot } from '@dailydotdev/shared/src/components/post/read/ReadTaboolaSlot';
import {
  getTaboolaCommentsPlacement,
  getTaboolaInContentPlacement,
  TABOOLA_ARTICLE_PLACEMENT,
  TABOOLA_COMMENTS_PER_AD,
} from '@dailydotdev/shared/src/features/monetization/taboola';
import { PhoneTopAdStrip } from '@dailydotdev/shared/src/components/post/read/PhoneTopAdStrip';
import { AdHeadHints } from '../../components/AdHeadHints';
import { useArticlePostLinks } from '../../hooks/useArticlePostLinks';
import { getLayout } from '../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../components/layouts/FooterNavBarLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getSeoDescription } from '../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../components/common';
import { noindexSeoProps } from '../../next-seo';
import type { PostParams } from '../posts/[id]/index';
import { seoTitle } from '../posts/[id]/index';

const Custom404 = dynamic(() => import(/* webpackChunkName: "404" */ '../404'));

const READ_ARTICLE_ROUTE_PATTERN =
  /^\/(?:articles\/[^/]+|posts\/[^/]+\/read)(?:[/?#]|$)/;

export interface ReadPostPageProps extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  error?: ApiError;
}

/**
 * Ad-monetised post template for paid-acquisition and organic landing traffic.
 *
 * Lives on its own route so `/posts/[id]` is untouched; it follows the same
 * `post_redesign` flag, rendering the focus card in the treatment arm with
 * this template's slot map. Differences from the standard template, all
 * deliberate: no
 * PostAuthBanner, no CustomAuthBanner (never passed in layoutProps), no
 * PostSignupWidget, and no sidebar at all — it carries no ad unit anymore,
 * and its post-boot mount was the page's last source of layout shift. The
 * header login/signup buttons are unaffected and render as usual.
 *
 * Noindexed because it duplicates `/posts/[id]` and exists for paid/ad
 * traffic, not search discovery. Forces light mode while mounted: the ad
 * partner's creatives are designed against light pages.
 */
const ReadPostPage = ({
  id,
  initialData,
  error,
}: ReadPostPageProps): ReactElement => {
  const router = useRouter();
  const { applyThemeMode } = useSettingsContext();
  const adSlots = useReadAdSlots();
  const kueezLive = hasLiveAdSlots(adSlots);
  const taboolaLive = useReadTaboola();
  const adsLive = kueezLive || taboolaLive;
  const contained = useArticlesContained();
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });
  useArticlePostLinks(contained, post);
  const { showRedesign } = usePostRedesign(post);
  // Every slot self-gates on the read map, so the set is built whenever the
  // card renders, like ReadPostContent's markup.
  const readAds = useMemo<PostFocusCardAds | undefined>(() => {
    if (!showRedesign) {
      return undefined;
    }
    const inBodyUnit = (
      section: 'summary' | 'body',
      index: number,
      hideOnPhone: boolean,
    ) => (
      <ReadAdSlot
        slot={READ_SLOT.inBodyMpu}
        format={ReadAdFormat.MediumRectangle}
        className="my-2"
        hideOnPhone={hideOnPhone}
        logExtra={{ section, occurrence: index + 1 }}
      />
    );
    // A collection's body is the story itself, so it opens the card without
    // the TLDR above it.
    const showSummary = !(
      post?.type === PostType.Collection && post.contentHtml
    );
    const summaryBreaks =
      post?.summary && showSummary
        ? splitTextForAds(
            post.summary,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          ).length - 1
        : 0;
    const hasSummaryUnits = summaryBreaks > 0;
    const hasBodyUnits =
      !!post?.contentHtml &&
      splitContentForAds(
        post.contentHtml,
        CONTENT_CHARS_PER_AD,
        MAX_CONTENT_ADS_PER_SECTION + 1,
      ).length > 1;
    // Same rule as the classic template: every break the MPU cadence uses,
    // numbered through the page, or one after content too short to break.
    const inContentTaboola = (occurrence: number) => (
      <ReadTaboolaSlot
        placement={getTaboolaInContentPlacement(occurrence)}
        className="my-2"
      />
    );
    return {
      withoutDirectSold: true,
      withoutSignupWidget: true,
      contained,
      belowComments: (
        <>
          {contained && post && <ReadNextArticles post={post} />}
          <ReadTaboolaSlot placement={TABOOLA_ARTICLE_PLACEMENT.belowArticle} />
        </>
      ),
      contentLeading: !contained && <ReadTopLeaderboard />,
      renderSummarySegments: !showSummary
        ? undefined
        : (summary, trailing) =>
            splitTextForAds(
              summary,
              CONTENT_CHARS_PER_AD,
              MAX_CONTENT_ADS_PER_SECTION + 1,
            ).map((part, index, parts) => (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={index}>
                <p className="select-text break-words text-text-secondary typo-markdown">
                  {part}
                  {index === parts.length - 1 && trailing}
                </p>
                {index < parts.length - 1 && inContentTaboola(index + 1)}
                {index < parts.length - 1 &&
                  inBodyUnit('summary', index, index > 0)}
              </React.Fragment>
            )),
      // Phone density policy, same as the classic template: only the page's
      // first in-content unit keeps a phone placement.
      renderBody: (contentHtml) =>
        splitContentForAds(
          contentHtml,
          CONTENT_CHARS_PER_AD,
          MAX_CONTENT_ADS_PER_SECTION + 1,
        ).map((chunk, index, chunks) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            <Markdown
              className="break-words"
              content={chunk}
              appendTooltipTo={() => globalThis?.document?.body}
            />
            {index < chunks.length - 1 &&
              inContentTaboola(summaryBreaks + index + 1)}
            {index < chunks.length - 1 &&
              inBodyUnit('body', index, hasSummaryUnits || index > 0)}
          </React.Fragment>
        )),
      // No phone placement for rail units: the phone's density budget is the
      // strip, the first in-content unit and the above-comments MPU.
      rail: [
        <ReadAdSlot
          key="after-source"
          slot={READ_SLOT.railAfterSource}
          format={ReadAdFormat.MediumRectangle}
          hideOnPhone
        />,
        <ReadAdSlot
          key="between-further-reading"
          slot={READ_SLOT.railBetweenFurtherReading}
          format={ReadAdFormat.MediumRectangle}
          hideOnPhone
        />,
        <ReadAdSlot
          key="bottom-sticky"
          slot={READ_SLOT.railBottomSticky}
          format={ReadAdFormat.HalfPage}
          hideOnPhone
        />,
      ],
      // Compliant as a publisher sticky at exactly 300px wide, desktop only,
      // one per viewport, closing the rail where nothing follows.
      railPinsLast: true,
      aboveComments: (
        <>
          {!hasSummaryUnits && !hasBodyUnits && inContentTaboola(1)}
          <ReadAdSlot
            slot={READ_SLOT.aboveCommentsMpu}
            format={ReadAdFormat.MediumRectangle}
            className="my-2"
          />
        </>
      ),
      commentAds: {
        interleaveEvery: taboolaLive
          ? TABOOLA_COMMENTS_PER_AD
          : COMMENTS_PER_INTERLEAVED_AD,
        renderInterleaved: (occurrence) => (
          <>
            <ReadAdSlot
              slot={READ_SLOT.commentMpu}
              format={ReadAdFormat.MediumRectangle}
              hideOnPhone
              logExtra={{ occurrence }}
            />
            <ReadTaboolaSlot
              placement={getTaboolaCommentsPlacement(occurrence)}
            />
          </>
        ),
      },
      // Taboola's rail widgets stand in for the whole Kueez rail while it
      // serves, unpinned: the sticky closing tower is a Kueez booking.
      ...(taboolaLive && {
        rail: [
          <ReadTaboolaSlot
            key="taboola-rail-1x1"
            placement={TABOOLA_ARTICLE_PLACEMENT.rightRail1x1}
            hideOnPhone
          />,
          <ReadTaboolaSlot
            key="taboola-rail-4x1"
            placement={TABOOLA_ARTICLE_PLACEMENT.rightRail4x1}
            hideOnPhone
          />,
        ],
        railPinsLast: false,
      }),
    };
  }, [showRedesign, taboolaLive, contained, post]);

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
    // Taboola's widgets are queued once per page load, so while it serves even
    // the next article has to load fresh: only the same page stays in place.
    const staysOnAdRoute = (url: string): boolean =>
      taboolaLive
        ? new URL(url, window.location.origin).pathname ===
          window.location.pathname
        : READ_ARTICLE_ROUTE_PATTERN.test(url);
    const forceHardNavigation = (
      url: string,
      { shallow }: { shallow: boolean },
    ): void => {
      // Shallow same-page updates (comment permalinks, URL-masking modals,
      // query tweaks) never unload anything — only a genuine departure from
      // the article ad route has ads to tear down.
      if (shallow || staysOnAdRoute(url)) {
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
      if (staysOnAdRoute(as)) {
        return true;
      }
      window.location.href = as;
      return false;
    });
    return () => {
      router.events.off('routeChangeStart', forceHardNavigation);
      // beforePopState is a single global slot; nothing else registers one
      // today, so resetting to pass-through is safe. If another surface ever
      // claims it, the two must be composed rather than overwritten.
      router.beforePopState(() => true);
    };
  }, [adsLive, taboolaLive, router]);

  if (isLoading) {
    return <PostLoadingSkeleton type={post?.type} />;
  }

  if (isError || error || !post) {
    return <Custom404 />;
  }

  // Below laptop MainLayoutHeader renders the feed nav, which a post route has
  // nothing to fill, so without the footer nav the page carries no navigation
  // on a phone. The post is deliberately not passed: that would add the mobile
  // floating comment bar, a third fixed element competing with the footer nav
  // and the anchor for the bottom of a phone screen. A contained page drops
  // the nav, every tab of which leads off the template.
  return (
    <ActivePostContextProvider post={post}>
      <FooterNavBarLayout hideNav={contained}>
        <Head>
          {!!post.image && <link rel="preload" as="image" href={post.image} />}
        </Head>
        {kueezLive && (
          <>
            <AdHeadHints />
            <Script
              id="prebid-loader"
              src={PREBID_SCRIPT_SRC}
              strategy="afterInteractive"
            />
          </>
        )}
        {showRedesign ? (
          <div className="mx-auto min-h-page w-full max-w-[72rem] pb-6">
            <PostFocusCard
              post={post}
              origin={Origin.ArticlePage}
              ads={readAds}
            />
          </div>
        ) : (
          <ReadPostContent
            post={post}
            // 72rem, wider than the standard template's 69.25rem: the main column
            // has to clear 728px for a leaderboard to render at its full size, and
            // at 69.25rem it only had 704px. 1152 - 340 rail - 64 padding = 748px.
            className="min-h-page max-w-[72rem] pb-6"
          />
        )}
        <ReadTaboolaSlot placement={TABOOLA_ARTICLE_PLACEMENT.exploreMore} />
      </FooterNavBarLayout>
    </ActivePostContextProvider>
  );
};

ReadPostPage.getLayout = (
  page: ReactNode,
  pageProps?: Record<string, unknown>,
  layoutProps?: MainLayoutProps,
): ReactNode => {
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const contained = useArticlesContained();
  return getLayout(page, pageProps, { ...layoutProps, contained });
};
ReadPostPage.layoutProps = {
  screenCentered: false,
  showSidebar: false,
  hideFeedbackWidget: true,
  // Only the pinned phone ad here, never CustomAuthBanner: this template
  // carries no auth banner.
  customBanner: <PhoneTopAdStrip surface="read" />,
};

export default ReadPostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<
  GetStaticPropsResult<ReadPostPageProps>
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
    // Links across the template lead here for every post, so the rest are
    // sent on to the regular post page rather than a 404.
    if (!isReadEligible) {
      return {
        redirect: { destination: `/posts/${id}`, permanent: false },
        revalidate: 60,
      };
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
      // The article's own cover rather than the generated share card:
      // an ad-bought click should land on exactly the image that sold it.
      ...(post.image && {
        openGraph: {
          ...pageSeoTitles.openGraph,
          images: [{ url: post.image, alt: post.title || 'Article cover' }],
        },
      }),
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
