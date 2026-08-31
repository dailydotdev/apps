import type { ComponentType, CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import {
  ArbitrageAdFormat,
  ArbitrageAdSlot,
} from '@dailydotdev/shared/src/components/post/arbitrage/ArbitrageAdSlot';
import { ArbitrageTopLeaderboard } from '@dailydotdev/shared/src/components/post/arbitrage/ArbitrageTopLeaderboard';
import { PostWidgetPosition } from '@dailydotdev/shared/src/components/post/PostWidgets';
import {
  ADSENSE_SCRIPT_SRC,
  hasLiveAdsenseUnits,
} from '@dailydotdev/shared/src/features/monetization/adsense';
import {
  COMMENTS_PER_INTERLEAVED_AD,
  CONTENT_CHARS_PER_AD,
  MAX_CONTENT_ADS_PER_SECTION,
  ORGANIC_SLOT,
} from '@dailydotdev/shared/src/components/post/arbitrage/slots';
import { splitTextForAds } from '@dailydotdev/shared/src/components/post/arbitrage/splitContentForAds';
import { useOrganicAdsenseSlots } from '@dailydotdev/shared/src/components/post/arbitrage/useReadAdsenseSlots';
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
import type {
  Comment,
  TopCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import { TOP_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import type { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import type { ClientError } from 'graphql-request';
import { SCROLL_OFFSET } from '@dailydotdev/shared/src/components/post/PostContent';
import type { PostContentProps } from '@dailydotdev/shared/src/components/post/common';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import {
  useEventListener,
  useJoinReferral,
  usePostById,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import classNames from 'classnames';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth/useOnboardingActions';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { isSourceUserSource } from '@dailydotdev/shared/src/graphql/sources';
import { usePostReferrerContext } from '@dailydotdev/shared/src/contexts/PostReferrerContext';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { LogExtraContextProvider } from '@dailydotdev/shared/src/contexts/LogExtraContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { useEngagementAdsContext } from '@dailydotdev/shared/src/contexts/EngagementAdsContext';
import { getEngagementLogExtra } from '@dailydotdev/shared/src/lib/engagementAds';
import { CompanionDemoWidget } from '@dailydotdev/shared/src/components/post/CompanionDemoWidget';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { isPostRedesignEligible } from '@dailydotdev/shared/src/hooks/post/usePostRedesign';
import { featurePostRedesign } from '@dailydotdev/shared/src/lib/featureManagement';
import { PostFocusCard } from '@dailydotdev/shared/src/components/post/focus/PostFocusCard';
import { AdsenseHeadHints } from '../../../components/AdsenseHeadHints';
import { getShareImageUrl, noindexSeoProps } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { getLayout } from '../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../components/layouts/FooterNavBarLayout';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../components/PostSEOSchema';
import type { DynamicSeoProps } from '../../../components/common';
import useSharedByToast from '../../../hooks/useSharedByToast';
import {
  getPostCanonicalUrl,
  getPostMarkdownUrl,
  shouldNoindexPost,
} from '../../../lib/seo';

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

const BriefPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyBriefPostContent" */ '@dailydotdev/shared/src/components/post/brief/BriefPostContent'
  ).then((module) => module.BriefPostContent),
);

const PollPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyPollPostContent" */ '@dailydotdev/shared/src/components/post/poll/PollPostContent'
  ).then((module) => module.PollPostContent),
);

const SocialTwitterPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazySocialTwitterPostContent" */ '@dailydotdev/shared/src/components/post/SocialTwitterPostContent'
  ).then((module) => module.SocialTwitterPostContent),
);

const DigestPostContent = dynamic(() =>
  import(
    /* webpackChunkName: "lazyDigestPostContent" */ '@dailydotdev/shared/src/components/post/digest/DigestPostContent'
  ).then((module) => module.DigestPostContent),
);

/**
 * Whether a URL is another post detail page — the only destinations that keep
 * client-side navigation while ads are live, because they re-enter this same
 * ad-carrying route. A bare `/posts/` prefix is NOT that: /posts/best-of/*,
 * /posts/latest, /posts/discussed and /posts/upvoted are list pages with no
 * slots, linked from this page's own rail, and navigating to them must tear
 * the ad globals down like any other departure.
 */
const POST_LIST_SEGMENTS = new Set([
  'best-of',
  'latest',
  'discussed',
  'upvoted',
]);
export const isPostDetailPath = (url: string): boolean => {
  const match = /^\/posts\/([^/?#]+)(?:[/?#]|$)/.exec(url);
  return !!match && !POST_LIST_SEGMENTS.has(match[1]);
};

export interface Props extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  topComments?: Comment[];
  error?: ApiError;
}

type PostContentComponent = ComponentType<PostContentProps>;

const CONTENT_MAP: Record<PostType, ComponentType<PostContentProps>> = {
  article: PostContent as PostContentComponent,
  share: SquadPostContent as PostContentComponent,
  welcome: SquadPostContent as PostContentComponent,
  freeform: SquadPostContent as PostContentComponent,
  [PostType.VideoYouTube]: PostContent as PostContentComponent,
  collection: CollectionPostContent as PostContentComponent,
  [PostType.Brief]: BriefPostContent as PostContentComponent,
  [PostType.Poll]: PollPostContent as PostContentComponent,
  [PostType.SocialTwitter]: SocialTwitterPostContent as PostContentComponent,
  [PostType.Digest]: DigestPostContent,
  [PostType.LiveRoom]: PostContent as PostContentComponent,
};

export interface PostParams extends ParsedUrlQuery {
  id: string;
}

export const seoTitle = (post: Post): string | undefined => {
  if (post?.title) {
    return post.title;
  }

  if (post?.sharedPost?.title) {
    return post.sharedPost.title;
  }

  const sourceName = isSourceUserSource(post?.source)
    ? `by ${post?.author?.username}`
    : `at ${post?.source?.name}`;
  return `Shared post ${sourceName}`;
};

export const PostPage = ({
  id,
  initialData,
  topComments,
  error,
}: Props): ReactElement => {
  useJoinReferral();
  const { logEvent } = useLogContext();
  const { getCreativeForTags } = useEngagementAdsContext();
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const isFallback = false;
  const { shouldShowAuthBanner } = useOnboardingActions();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { post, isError, isLoading } = usePostById({
    id,
    options: {
      initialData,
      retry: false,
    },
  });
  const isRedesignEligible = isPostRedesignEligible(post);
  const { value: isRedesignFlagOn } = useConditionalFeature({
    feature: featurePostRedesign,
    shouldEvaluate: isRedesignEligible,
  });
  // Entry-specific flows the focus card doesn't render (author onboarding via
  // `?author`, back-to-squad via `?squad`) stay on the classic layout.
  const requiresClassicLayout = !!router.query?.author || !!router.query?.squad;
  const showRedesign =
    isRedesignEligible && !requiresClassicLayout && isRedesignFlagOn;
  // Empty for every logged-in visitor; the slot components check the same
  // hook, so with it empty neither markup nor script exists. Gated on a unit
  // id being present, not key presence — the map keeps placeholder entries
  // with empty ids, and the script must not load for inventory that cannot
  // fill.
  const adsenseSlots = useOrganicAdsenseSlots(!showRedesign);
  const adsenseActive = hasLiveAdsenseUnits(adsenseSlots);
  // The same in-content treatment the /articles template ships, reused on
  // the organic page: the TLDR splits at the shared cadence with an MPU
  // between segments (phones keep only the first), an MPU sits above the
  // comments, and a long thread carries one per interval — all only while
  // ads are live, so members and modal/extension surfaces keep the
  // untouched production markup.
  const summarySegments = useMemo(
    () =>
      adsenseActive && post?.summary
        ? splitTextForAds(
            post.summary,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          )
        : null,
    [adsenseActive, post?.summary],
  );
  const renderSummarySegments = useMemo(() => {
    if (!summarySegments) {
      return undefined;
    }
    // A render prop, not a component: PostContent calls it as a function.
    // eslint-disable-next-line react/display-name
    return () => (
      <>
        {summarySegments.map((segment, index, segments) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            <div className="mb-6 overflow-hidden text-text-secondary">
              <p
                className="select-text break-words typo-markdown"
                data-testid={index === 0 ? 'tldr-container' : undefined}
              >
                {segment}
              </p>
            </div>
            {index < segments.length - 1 && (
              <ArbitrageAdSlot
                surface="organic"
                slot={ORGANIC_SLOT.inContentMpu}
                format={ArbitrageAdFormat.MediumRectangle}
                className="my-6"
                hideOnPhone={index > 0}
                logExtra={{ section: 'summary', occurrence: index + 1 }}
              />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }, [summarySegments]);

  // Same boundary the /read template draws: adsbygoogle must never follow a
  // client-side navigation off the post pages, because its Auto ads overlays
  // persist across soft navigations. Post-to-post stays client-side — the
  // destination carries its own slots — while any departure forces a full
  // page load that tears every Google global down.
  useEffect(() => {
    if (!adsenseActive) {
      return undefined;
    }
    const forceHardNavigation = (
      url: string,
      { shallow }: { shallow: boolean },
    ): void => {
      if (shallow || isPostDetailPath(url)) {
        return;
      }
      router.events.emit('routeChangeError');
      window.location.assign(url);
      // Next.js has no cancel API; throwing inside the handler is the
      // established way to abort the client-side transition.
      throw new Error(`Aborted client navigation to ${url} to unload ads`);
    };
    router.events.on('routeChangeStart', forceHardNavigation);
    // On popstate the history pointer has already moved, so assign() would
    // navigate forward again; loading the target URL in place respects the
    // position the user just moved to.
    router.beforePopState(({ as }) => {
      if (isPostDetailPath(as)) {
        return true;
      }
      window.location.href = as;
      return false;
    });
    return () => {
      router.events.off('routeChangeStart', forceHardNavigation);
      router.beforePopState(() => true);
    };
  }, [adsenseActive, router]);
  const featureTheme = useFeatureTheme();
  const containerClass = classNames(
    'mb-16 min-h-page max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
    [
      PostType.Share,
      PostType.Welcome,
      PostType.Freeform,
      PostType.SocialTwitter,
    ].includes(post?.type),
    featureTheme && 'bg-transparent',
  );
  useSharedByToast();

  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET,
    scrollProperty: 'scrollY',
  });

  const onScroll = useCallback(() => {
    logEvent({
      event_name: LogEvent.PageScroll,
      target_type: TargetType.Post,
      target_id: id,
      extra: JSON.stringify({
        scrollTop: window.scrollY,
      }),
    });
  }, [logEvent, id]);
  const [debouncedOnScroll] = useDebounceFn(onScroll, 100);
  useEventListener(globalThis?.window, 'scroll', debouncedOnScroll);

  const privateSourceJoin = usePrivateSourceJoin({ postId: id });

  const { usePostReferrer } = usePostReferrerContext() as {
    usePostReferrer: (props: { post?: Post }) => void;
  };

  usePostReferrer({ post });

  if (isLoading || privateSourceJoin.isActive) {
    return (
      <>
        <PostSEOSchema post={post} topComments={topComments} />
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
    <ActivePostContextProvider post={post}>
      <LogExtraContextProvider
        selector={() => {
          const creative = getCreativeForTags(post?.tags || []);
          return {
            referrer_target_id: post?.id,
            referrer_target_type: post?.id ? TargetType.Post : undefined,
            ...(creative && getEngagementLogExtra(creative)),
          };
        }}
      >
        <FooterNavBarLayout post={post}>
          <Head>
            <link rel="preload" as="image" href={post?.image} />
          </Head>
          {adsenseActive && (
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
          {showRedesign ? (
            <div className="mx-auto w-full max-w-[63.75rem]">
              <PostFocusCard post={post} origin={Origin.ArticlePage} />
            </div>
          ) : (
            <Content
              position={position}
              isPostPage
              post={post}
              isFallback={isFallback}
              backToSquad={!!router?.query?.squad}
              shouldOnboardAuthor={!!router.query?.author}
              origin={Origin.ArticlePage}
              isBannerVisible={shouldShowAuthBanner && !isLaptop}
              contentLeading={
                adsenseActive ? (
                  <ArbitrageTopLeaderboard
                    surface="organic"
                    slot={ORGANIC_SLOT.topLeaderboard}
                    phoneSlot={ORGANIC_SLOT.topLeaderboardPhone}
                  />
                ) : undefined
              }
              // Only while ads are actually live: a truthy hook flattens the
              // further-reading widget around the slot, and without an ad that
              // changes rail spacing for members who never see one.
              renderSummarySegments={renderSummarySegments}
              aboveComments={
                adsenseActive ? (
                  <ArbitrageAdSlot
                    surface="organic"
                    slot={ORGANIC_SLOT.aboveCommentsMpu}
                    format={ArbitrageAdFormat.MediumRectangle}
                    className="my-6"
                  />
                ) : undefined
              }
              commentAds={
                adsenseActive
                  ? {
                      interleaveEvery: COMMENTS_PER_INTERLEAVED_AD,
                      renderInterleaved: (occurrence) => (
                        <ArbitrageAdSlot
                          surface="organic"
                          slot={ORGANIC_SLOT.commentMpu}
                          format={ArbitrageAdFormat.MediumRectangle}
                          hideOnPhone
                          logExtra={{ occurrence }}
                        />
                      ),
                    }
                  : undefined
              }
              getWidgetRailAd={
                adsenseActive
                  ? (widgetPosition) =>
                      widgetPosition === PostWidgetPosition.DirectAd ? (
                        <ArbitrageAdSlot
                          surface="organic"
                          slot={ORGANIC_SLOT.railAfterDirectAd}
                          format={ArbitrageAdFormat.MediumRectangle}
                        />
                      ) : null
                  : undefined
              }
              className={{
                container: containerClass,
                fixedNavigation: { container: 'flex laptop:hidden' },
                navigation: {
                  container: 'flex tablet:hidden',
                  actions: 'flex-1 justify-between',
                },
              }}
            />
          )}
          {!showRedesign && shouldShowAuthBanner && isLaptop && (
            <PostAuthBanner />
          )}
          <CompanionDemoWidget />
        </FooterNavBarLayout>
      </LogExtraContextProvider>
    </ActivePostContextProvider>
  );
};

PostPage.getLayout = getLayout;
PostPage.layoutProps = {
  screenCentered: false,
  customBanner: <CustomAuthBanner />,
};

export default PostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  if (!params?.id) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  const { id } = params;
  try {
    // Fetch post data and top comments in parallel
    const [initialData, commentsData] = await Promise.all([
      gqlClient.request<PostData>(POST_BY_ID_STATIC_FIELDS_QUERY, { id }),
      gqlClient
        .request<TopCommentsData>(TOP_COMMENTS_QUERY, { postId: id, first: 5 })
        .catch(() => ({ topComments: [] })), // Gracefully handle comment fetch errors
    ]);

    const post = initialData.post as Post;
    const topComments = commentsData.topComments || [];
    const pageSeoTitles = getPageSeoTitles(seoTitle(post) ?? '');
    const noindex = shouldNoindexPost(post);
    const seo: NextSeoProps = {
      canonical: post?.slug ? getPostCanonicalUrl(post.slug) : undefined,
      title: pageSeoTitles.title,
      description: getSeoDescription(post),
      noindex,
      additionalLinkTags:
        post && !noindex
          ? [
              {
                rel: 'alternate',
                type: 'text/markdown',
                href: getPostMarkdownUrl({ post }),
              },
            ]
          : undefined,
      openGraph: {
        ...pageSeoTitles.openGraph,
        images: [
          {
            url: getShareImageUrl('posts', post?.id ?? ''),
            width: 1200,
            height: 630,
            alt: post?.title || 'Post cover image',
          },
        ],
        article: {
          publishedTime: post?.createdAt,
          modifiedTime: post?.updatedAt,
          tags: post?.tags,
          authors: post?.author?.permalink ? [post.author.permalink] : [],
        },
        locale: post?.language || 'en',
      },
    };

    return {
      props: {
        id: initialData.post.id,
        initialData,
        topComments,
        seo,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const responseErrors = clientError?.response?.errors;
    const errorCode = responseErrors?.[0]?.extensions?.code;
    const errors = Object.values(ApiError);
    if (errors.includes(errorCode)) {
      // Return proper 404 for not found posts (better for SEO/crawl budget)
      if (errorCode === ApiError.NotFound) {
        return {
          notFound: true,
        };
      }

      const { postId } = responseErrors?.[0]?.extensions ?? {};

      // FORBIDDEN lands here for every post in a private squad, since the ISR
      // fetch is unauthenticated. Without seo these fell back to index,follow.
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
