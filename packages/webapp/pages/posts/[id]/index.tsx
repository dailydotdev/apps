import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { POST_CONTENT_MAP } from '@dailydotdev/shared/src/components/post/postContentMap';
import Script from 'next/script';
import {
  ReadAdFormat,
  ReadAdSlot,
} from '@dailydotdev/shared/src/components/post/read/ReadAdSlot';
import { ReadTopLeaderboard } from '@dailydotdev/shared/src/components/post/read/ReadTopLeaderboard';
import { PhoneTopAdStrip } from '@dailydotdev/shared/src/components/post/read/PhoneTopAdStrip';
import { PostWidgetPosition } from '@dailydotdev/shared/src/components/post/PostWidgets';
import {
  hasLiveAdSlots,
  PREBID_SCRIPT_SRC,
} from '@dailydotdev/shared/src/features/monetization/kueez';
import {
  COMMENTS_PER_INTERLEAVED_AD,
  CONTENT_CHARS_PER_AD,
  MAX_CONTENT_ADS_PER_SECTION,
  ORGANIC_SLOT,
} from '@dailydotdev/shared/src/components/post/read/slots';
import { splitTextForAds } from '@dailydotdev/shared/src/components/post/read/splitContentForAds';
import { useOrganicAdSlots } from '@dailydotdev/shared/src/components/post/read/useReadAdSlots';
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
import { ReadingDrawer } from '@dailydotdev/shared/src/components/shell/ReadingDrawer';
import {
  isReadingOpen,
  peekReadingOpen,
} from '@dailydotdev/shared/src/components/shell/readingStore';
import { SCROLL_OFFSET } from '@dailydotdev/shared/src/components/post/PostContent';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import {
  LogEvent,
  Origin,
  TargetId,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featurePostSignupStrip } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  useEventListener,
  useJoinReferral,
  usePostById,
  useShareLinkClick,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import { useQueryClient } from '@tanstack/react-query';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  ApiError,
  getApiError,
  gqlClient,
} from '@dailydotdev/shared/src/graphql/common';
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
import { isSourceAdFree } from '@dailydotdev/shared/src/lib/ads';
import { CompanionDemoWidget } from '@dailydotdev/shared/src/components/post/CompanionDemoWidget';
import { AdHeadHints } from '../../../components/AdHeadHints';
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

const PostAuthBanner = dynamic(() =>
  import(
    /* webpackChunkName: "postAuthBanner" */ '@dailydotdev/shared/src/components/auth/PostAuthBanner'
  ).then((module) => module.PostAuthBanner),
);

const PinnedSignupStrip = dynamic(() =>
  import(
    /* webpackChunkName: "pinnedSignupStrip" */ '@dailydotdev/shared/src/components/auth/PinnedSignupStrip'
  ).then((module) => module.PinnedSignupStrip),
);

export interface Props extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  topComments?: Comment[];
  error?: ApiError;
}

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
  useShareLinkClick({ postId: post?.id });
  const queryClient = useQueryClient();
  const postError = (isError
    ? queryClient.getQueryState(getPostByIdKey(id))?.error
    : undefined) as unknown as ApiErrorResult;
  const showLaptopAuthBanner = shouldShowAuthBanner && isLaptop;
  const { value: isSignupStripOn, isLoading: isSignupStripLoading } =
    useConditionalFeature({
      feature: featurePostSignupStrip,
      shouldEvaluate: showLaptopAuthBanner,
    });
  const showPostAuthBanner =
    showLaptopAuthBanner && !isSignupStripLoading && !isSignupStripOn;
  const showSignupStrip =
    showLaptopAuthBanner && !isSignupStripLoading && isSignupStripOn;
  // Empty for every logged-in visitor and for posts in ad-free squads; the
  // slot components check the same hook, so with it empty neither markup nor
  // the Prebid bundle exists.
  const adSlots = useOrganicAdSlots(post);
  const adsActive = hasLiveAdSlots(adSlots);
  // The same in-content treatment the /articles template ships, reused on
  // the organic page: the TLDR splits at the shared cadence with an MPU
  // between segments (phones keep only the first), an MPU sits above the
  // comments, and a long thread carries one per interval — all only while
  // ads are live, so members and modal/extension surfaces keep the
  // untouched production markup.
  const summarySegments = useMemo(
    () =>
      adsActive && post?.summary
        ? splitTextForAds(
            post.summary,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          )
        : null,
    [adsActive, post?.summary],
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
              <ReadAdSlot
                surface="organic"
                slot={ORGANIC_SLOT.inContentMpu}
                format={ReadAdFormat.MediumRectangle}
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
  // Only the article and video templates carry in-page units; squad and
  // collection posts keep the pinned phone strip alone.
  const carriesInPageAds =
    post?.type === PostType.Article || post?.type === PostType.VideoYouTube;
  const organicAds = useMemo(
    () =>
      adsActive && carriesInPageAds
        ? {
            contentLeading: (
              <ReadTopLeaderboard
                surface="organic"
                slot={ORGANIC_SLOT.topLeaderboard}
              />
            ),
            renderSummarySegments,
            railAd: (
              <ReadAdSlot
                surface="organic"
                slot={ORGANIC_SLOT.railAfterDirectAd}
                format={ReadAdFormat.MediumRectangle}
              />
            ),
            aboveComments: (
              <ReadAdSlot
                surface="organic"
                slot={ORGANIC_SLOT.aboveCommentsMpu}
                format={ReadAdFormat.MediumRectangle}
                className="my-6"
              />
            ),
            commentAds: {
              interleaveEvery: COMMENTS_PER_INTERLEAVED_AD,
              renderInterleaved: (occurrence: number) => (
                <ReadAdSlot
                  surface="organic"
                  slot={ORGANIC_SLOT.commentMpu}
                  format={ReadAdFormat.MediumRectangle}
                  hideOnPhone
                  logExtra={{ occurrence }}
                />
              ),
            },
          }
        : undefined,
    [adsActive, carriesInPageAds, renderSummarySegments],
  );

  const featureTheme = useFeatureTheme();
  const containerClass = classNames(
    'mb-16 min-h-page max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
    [PostType.Share, PostType.Freeform, PostType.SocialTwitter].includes(
      post?.type,
    ),
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

  // Arriving from a feed card's Read, the drawer opens over the loading
  // page with the card's copy of the post, and stays the same drawer once
  // the page has its own.
  const arrivingPost = useMemo(() => peekReadingOpen(id), [id]);
  const drawerPost = post ?? arrivingPost;
  const logExtra = () => {
    const creative = isSourceAdFree(drawerPost?.source)
      ? null
      : getCreativeForTags(drawerPost?.tags || []);
    return {
      referrer_target_id: drawerPost?.id,
      referrer_target_type: drawerPost?.id ? TargetType.Post : undefined,
      ...(creative && getEngagementLogExtra(creative)),
      ...(isReadingOpen() && { reading_drawer: true }),
    };
  };
  const readingDrawer = drawerPost && (
    <LogExtraContextProvider key="reading-drawer" selector={logExtra}>
      <ReadingDrawer post={drawerPost} />
    </LogExtraContextProvider>
  );

  if (isLoading || privateSourceJoin.isActive) {
    return (
      <>
        <PostSEOSchema post={post} topComments={topComments} />
        <PostLoadingSkeleton className={containerClass} />
        {readingDrawer}
      </>
    );
  }

  const Content = POST_CONTENT_MAP[post?.type];
  // A post deleted while the page is open still has to disappear, so NOT_FOUND
  // overrides the cached copy. Any other error leaves the post on screen.
  const isPostGone = !!getApiError(postError, ApiError.NotFound);

  if (!Content || isPostGone) {
    if (
      error === ApiError.Forbidden ||
      getApiError(postError, ApiError.Forbidden)
    ) {
      return <Unauthorized />;
    }
    return <Custom404 />;
  }

  return (
    <>
      <ActivePostContextProvider post={post}>
        <LogExtraContextProvider selector={logExtra}>
          <FooterNavBarLayout post={post}>
            <Head>
              <link rel="preload" as="image" href={post?.image} />
            </Head>
            {adsActive && (
              <>
                <AdHeadHints />
                <Script
                  id="prebid-loader"
                  src={PREBID_SCRIPT_SRC}
                  strategy="afterInteractive"
                />
              </>
            )}
            <PostSEOSchema post={post} topComments={topComments} />
            <Content
              position={position}
              isPostPage
              post={post}
              isFallback={isFallback}
              backToSquad={!!router?.query?.squad}
              shouldOnboardAuthor={!!router.query?.author}
              origin={Origin.ArticlePage}
              isBannerVisible={shouldShowAuthBanner && !isLaptop}
              contentLeading={organicAds?.contentLeading}
              renderSummarySegments={organicAds?.renderSummarySegments}
              aboveComments={organicAds?.aboveComments}
              commentAds={organicAds?.commentAds}
              // Only while ads are actually live: a truthy hook flattens the
              // further-reading widget around the slot, and without an ad that
              // changes rail spacing for members who never see one.
              getWidgetRailAd={
                organicAds
                  ? (widgetPosition) =>
                      widgetPosition === PostWidgetPosition.DirectAd
                        ? organicAds.railAd
                        : null
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
            {showSignupStrip && (
              <div className="m-auto w-full max-w-[69.25rem]">
                <PinnedSignupStrip targetId={TargetId.PostStrip} />
              </div>
            )}
            {showPostAuthBanner && <PostAuthBanner />}
            <CompanionDemoWidget />
          </FooterNavBarLayout>
        </LogExtraContextProvider>
      </ActivePostContextProvider>
      {readingDrawer}
    </>
  );
};

const getPostPageLayout: typeof getLayout = (page, pageProps, layoutProps) => {
  const { id, initialData } = (pageProps ?? {}) as Partial<Props>;

  return getLayout(
    // A post opened from another post reuses this route, and an ad slot runs
    // its auction once per mount, so the page and the strip remount per post.
    <React.Fragment key={id}>{page}</React.Fragment>,
    pageProps,
    {
      ...layoutProps,
      // Strip first: both pin, and the banner's top offset is the strip's height.
      customBanner: (
        <>
          <PhoneTopAdStrip
            key={id}
            surface="organic"
            post={initialData?.post}
          />
          <CustomAuthBanner />
        </>
      ),
    },
  );
};

PostPage.getLayout = getPostPageLayout;
PostPage.layoutProps = {};

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
    const initialData = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );

    const post = initialData.post as Post;
    if (post?.slug && id !== post.id && id !== post.slug) {
      return {
        redirect: { destination: `/posts/${post.slug}`, permanent: true },
        revalidate: 60,
      };
    }

    const commentsData: TopCommentsData = post?.numComments
      ? await gqlClient
          .request<TopCommentsData>(TOP_COMMENTS_QUERY, {
            postId: post.id,
            first: 5,
          })
          .catch(() => ({ topComments: [] }))
      : { topComments: [] };
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
