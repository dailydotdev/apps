import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useContext, useEffect, useMemo } from 'react';
import {
  BlockIcon,
  DiscussIcon,
  HashtagIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  TAG_FEED_QUERY,
  TAG_TOP_POSTS_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import type {
  TopPost,
  TopPostsData,
} from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { GET_RECOMMENDED_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  ReferralCampaignKey,
  useFeedLayout,
} from '@dailydotdev/shared/src/hooks';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import CustomFeedOptionsMenu from '@dailydotdev/shared/src/components/CustomFeedOptionsMenu';
import { ArchiveEntryCard } from '@dailydotdev/shared/src/components/archive/ArchiveEntryCard';
import { ArchiveBreadcrumbs } from '@dailydotdev/shared/src/components/archive/ArchiveBreadcrumbs';
import { ArchiveScopeType } from '@dailydotdev/shared/src/graphql/archive';
import { useContentPreference } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { SponsoredTagHero } from '@dailydotdev/shared/src/components/brand/SponsoredTagHero';
import {
  getTagFaqItems,
  TagBestOfTabs,
  TagCommunity,
  TagFaq,
  TagFeaturedPost,
  TagHero,
  TagLearnSection,
  TagSignupCta,
  TagUniverse,
} from '../../components/tags/TagPageSections';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import type { DynamicSeoProps } from '../../components/common';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getAppOrigin } from '../../lib/seo';

const appOrigin = getAppOrigin();

interface TagPageProps extends DynamicSeoProps {
  tag: string;
  initialData: Keyword | null;
  topPosts: TopPost[];
  recommendedTags: TagsData['tags'];
  topContributors: UserShortProfile[];
  topSources: Source[];
}

const getTagPageJsonLd = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
  topSources,
}: {
  tag: string;
  initialData: Keyword;
  topPosts: TopPost[];
  recommendedTags: TagsData['tags'];
  topContributors: UserShortProfile[];
  topSources: Source[];
}): string => {
  const encodedTag = encodeURIComponent(tag);
  const tagTitle = initialData.flags?.title || tag;
  const tagDescription =
    initialData.flags?.description ||
    `Find all the recent posts, videos, updates and discussions about ${tagTitle}`;
  const tagUrl = `${appOrigin}/tags/${encodedTag}`;
  const faqItems = getTagFaqItems({
    tag,
    title: tagTitle,
    description: tagDescription,
    occurrences: initialData.occurrences,
    recommendedTags,
    topContributors,
    topSources,
  });

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${tagUrl}#page`,
        url: tagUrl,
        name: `${tagTitle} posts on daily.dev`,
        description: tagDescription,
        about: { '@id': `${tagUrl}#term` },
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      {
        '@type': 'DefinedTerm',
        '@id': `${tagUrl}#term`,
        name: tagTitle,
        description: tagDescription,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'daily.dev developer topics',
          url: `${appOrigin}/tags`,
        },
      },
      ...(topPosts.length
        ? [
            {
              '@type': 'ItemList',
              '@id': `${tagUrl}#items`,
              numberOfItems: topPosts.length,
              itemListElement: topPosts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appOrigin}/posts/${post.slug || post.id}`,
                name: post.title || '',
              })),
            },
          ]
        : []),
      ...(faqItems.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${tagUrl}#faq`,
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: appOrigin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tags',
            item: `${appOrigin}/tags`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tagTitle,
          },
        ],
      },
    ],
  });
};

const TagPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
  topSources,
}: TagPageProps): ReactElement => {
  const { push, replace, query } = useRouter();
  const showRoadmap = useFeature(feature.showRoadmap);
  const { user, showLogin } = useContext(AuthContext);
  const mostUpvotedQueryVariables = useMemo(
    () => ({
      tag,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
        PostType.Share,
        PostType.Freeform,
        PostType.LiveRoom,
      ],
      period: 365,
    }),
    [tag],
  );
  const topPostsQueryVariables = useMemo(
    () => ({
      tag,
      ranking: 'POPULARITY',
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
        PostType.Share,
        PostType.Freeform,
        PostType.LiveRoom,
      ],
    }),
    [tag],
  );
  const bestDiscussedQueryVariables = useMemo(
    () => ({
      tag,
      period: 365,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
        PostType.Share,
        PostType.Freeform,
        PostType.LiveRoom,
      ],
    }),
    [tag],
  );
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      tag,
      ranking: 'TIME',
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
        PostType.Share,
        PostType.Freeform,
        PostType.LiveRoom,
      ],
    }),
    [tag],
  );
  const { feedSettings } = useFeedSettings();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: Origin.TagPage });
  const title = initialData?.flags?.title || tag;
  const jsonLd = initialData
    ? getTagPageJsonLd({
        tag,
        initialData,
        topPosts,
        recommendedTags,
        topContributors,
        topSources,
      })
    : null;
  const { follow, unfollow } = useContentPreference({
    showToastOnSuccess: false,
  });
  const personalizedTags = useMemo(() => {
    const relatedTags = recommendedTags
      .map((recommendedTag) => recommendedTag.name)
      .filter((recommendedTag): recommendedTag is string => !!recommendedTag);

    return Array.from(new Set([tag, ...relatedTags])).slice(0, 6);
  }, [recommendedTags, tag]);

  const tagStatus = useMemo(() => {
    if (!feedSettings) {
      return 'unfollowed';
    }
    const blockedTags = feedSettings.blockedTags ?? [];
    if (blockedTags.includes(tag)) {
      return 'blocked';
    }
    const includedTags = feedSettings.includeTags ?? [];
    if (includedTags.includes(tag)) {
      return 'followed';
    }
    return 'unfollowed';
  }, [feedSettings, tag]);

  useEffect(() => {
    const tagsToFollowParam = query.followTags;
    if (!user || typeof tagsToFollowParam !== 'string') {
      return;
    }

    const tagsToFollow = tagsToFollowParam
      .split(',')
      .map((value) => decodeURIComponent(value.trim()))
      .filter(Boolean);

    if (tagsToFollow.length === 0) {
      return;
    }

    const followTags = async (): Promise<void> => {
      await onFollowTags({ tags: Array.from(new Set(tagsToFollow)) });

      const params = new URLSearchParams(globalThis.location.search);
      params.delete('followTags');
      const search = params.toString();
      await replace(
        `${globalThis.location.pathname}${search ? `?${search}` : ''}`,
        undefined,
        { shallow: true },
      );
    };

    followTags().catch(() => undefined);
  }, [onFollowTags, query.followTags, replace, user]);

  const openPersonalizedSignup = (): void => {
    const encodedTags = personalizedTags.map(encodeURIComponent).join(',');
    showLogin({
      trigger: AuthTriggers.Filter,
      options: {
        afterAuth: `/tags/${encodeURIComponent(tag)}?followTags=${encodedTags}`,
      },
    });
  };

  const handleFollowClick = async (): Promise<void> => {
    if (!user) {
      openPersonalizedSignup();
      return;
    }

    if (tagStatus === 'followed') {
      await onUnfollowTags({ tags: [tag] });
      return;
    }

    await onFollowTags({ tags: [tag] });
  };

  const handleBlockClick = async (): Promise<void> => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Filter });
      return;
    }

    if (tagStatus === 'blocked') {
      await onUnblockTags({ tags: [tag] });
      return;
    }

    await onBlockTags({ tags: [tag] });
  };

  const handlePrimaryAction = async (): Promise<void> => {
    if (tagStatus === 'blocked') {
      await handleBlockClick();
      return;
    }

    await handleFollowClick();
  };

  const tagMenuOptions =
    tagStatus === 'followed'
      ? []
      : [
          {
            icon: <MenuIcon Icon={BlockIcon} />,
            label: tagStatus === 'blocked' ? 'Unblock tag' : 'Block tag',
            action: handleBlockClick,
          },
        ];

  return (
    <FeedPageLayoutComponent>
      {jsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        </Head>
      )}
      <ArchiveBreadcrumbs
        items={[{ label: 'Tags', href: '/tags' }, { label: title }]}
        className="mx-4"
      />
      <TagHero
        tag={tag}
        title={title}
        description={initialData?.flags?.description}
        occurrences={initialData?.occurrences}
        contributorsCount={topContributors.length}
        sourcesCount={topSources.length}
        relatedTagsCount={recommendedTags.length}
        tagStatus={tagStatus}
        isAnonymous={!user}
        onPrimaryAction={handlePrimaryAction}
        sponsoredHero={<SponsoredTagHero tag={tag} />}
        actions={
          <CustomFeedOptionsMenu
            buttonVariant={ButtonVariant.Secondary}
            additionalOptions={tagMenuOptions}
            onCreateNewFeed={() =>
              push(
                `/feeds/new?entityId=${tag}&entityType=${ContentPreferenceType.Keyword}`,
              )
            }
            onAdd={(feedId) =>
              follow({
                id: tag,
                entity: ContentPreferenceType.Keyword,
                entityName: tag,
                feedId,
              })
            }
            onUndo={(feedId) =>
              unfollow({
                id: tag,
                entity: ContentPreferenceType.Keyword,
                entityName: tag,
                feedId,
              })
            }
            shareProps={{
              text: `Check out the ${tag} tag on daily.dev`,
              link: globalThis?.location?.href,
              cid: ReferralCampaignKey.ShareTag,
              logObject: () => ({
                event_name: LogEvent.ShareTag,
                target_id: tag,
              }),
            }}
          />
        }
        seoLinks={
          <>
            {topPosts.length > 0 && (
              <div className="sr-only">
                {topPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug || post.id}`}
                    prefetch={false}
                  >
                    <a>{post.title}</a>
                  </Link>
                ))}
              </div>
            )}
            {recommendedTags.length > 0 && (
              <div className="sr-only">
                {recommendedTags
                  .map((relatedTag) => relatedTag.name)
                  .filter((relatedTag): relatedTag is string => !!relatedTag)
                  .map((relatedTag) => (
                    <Link
                      key={relatedTag}
                      href={`/tags/${relatedTag}`}
                      prefetch={false}
                    >
                      <a>Posts about {relatedTag}</a>
                    </Link>
                  ))}
              </div>
            )}
            {topContributors.length > 0 && (
              <div className="sr-only">
                {topContributors.map((contributor) => (
                  <Link
                    key={contributor.id}
                    href={contributor.permalink}
                    prefetch={false}
                  >
                    <a>Posts by {contributor.name}</a>
                  </Link>
                ))}
              </div>
            )}
            {topSources.length > 0 && (
              <div className="sr-only">
                {topSources.map((source) => (
                  <Link
                    key={source.id || source.permalink}
                    href={source.permalink}
                    prefetch={false}
                  >
                    <a>Posts from {source.name}</a>
                  </Link>
                ))}
              </div>
            )}
          </>
        }
      />
      <TagFeaturedPost tagTitle={title} post={topPosts[0]} />
      {!user && (
        <TagSignupCta
          tagTitle={title}
          relatedTagsCount={Math.max(personalizedTags.length - 1, 0)}
          onClick={openPersonalizedSignup}
        />
      )}
      <TagBestOfTabs
        tagTitle={title}
        topPostsFeed={
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsTopPosts }}
          >
            <HorizontalFeed
              feedName={OtherFeedPage.TagsTopPosts}
              feedQueryKey={[
                'tagsTopPosts',
                user?.id ?? 'anonymous',
                Object.values(topPostsQueryVariables),
              ]}
              query={TAG_FEED_QUERY}
              variables={topPostsQueryVariables}
              title={{
                copy: 'Top posts',
                icon: <HashtagIcon size={IconSize.Medium} className="mr-1.5" />,
              }}
              className="!mx-0 !mb-0 laptop:!mx-0"
              emptyScreen={<></>}
            />
          </ActiveFeedNameContext.Provider>
        }
        mostUpvotedFeed={
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
          >
            <HorizontalFeed
              feedName={OtherFeedPage.TagsMostUpvoted}
              feedQueryKey={[
                'tagsMostUpvoted',
                user?.id ?? 'anonymous',
                Object.values(mostUpvotedQueryVariables),
              ]}
              query={MOST_UPVOTED_FEED_QUERY}
              variables={mostUpvotedQueryVariables}
              title={{
                copy: 'Most upvoted posts',
                icon: <UpvoteIcon size={IconSize.Medium} className="mr-1.5" />,
              }}
              className="!mx-0 !mb-0 laptop:!mx-0"
              emptyScreen={<></>}
            />
          </ActiveFeedNameContext.Provider>
        }
        bestDiscussedFeed={
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsBestDiscussed }}
          >
            <HorizontalFeed
              feedName={OtherFeedPage.TagsBestDiscussed}
              feedQueryKey={[
                'tagsBestDiscussed',
                user?.id ?? 'anonymous',
                Object.values(bestDiscussedQueryVariables),
              ]}
              query={MOST_DISCUSSED_FEED_QUERY}
              variables={bestDiscussedQueryVariables}
              title={{
                copy: 'Best discussed posts',
                icon: <DiscussIcon size={IconSize.Medium} className="mr-1.5" />,
              }}
              className="!mx-0 !mb-0 laptop:!mx-0"
              emptyScreen={<></>}
            />
          </ActiveFeedNameContext.Provider>
        }
      />
      <TagCommunity
        tag={tag}
        tagTitle={title}
        initialUsers={topContributors}
        initialSources={topSources}
      />
      <TagUniverse
        tag={tag}
        tagTitle={title}
        blockedTags={feedSettings?.blockedTags}
        initialTags={recommendedTags}
      />
      <TagLearnSection
        tag={tag}
        tagTitle={title}
        roadmapUrl={showRoadmap ? initialData?.flags?.roadmap : undefined}
        archive={
          <ArchiveEntryCard
            scopeType={ArchiveScopeType.Tag}
            scopeId={tag}
            scopeName={title}
            className="!mx-0 !mb-0 laptop:!mx-0"
          />
        }
      />
      <TagFaq
        tag={tag}
        tagTitle={title}
        description={initialData?.flags?.description}
        occurrences={initialData?.occurrences}
        recommendedTags={recommendedTags}
        topContributors={topContributors}
        topSources={topSources}
      />
      <div className="mx-4 mb-5 flex w-auto items-center">
        <p className="flex items-center font-bold typo-body">
          All posts about {tag}
        </p>
      </div>
      <Feed
        feedName={OtherFeedPage.Tag}
        feedQueryKey={[
          'tagFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={TAG_FEED_QUERY}
        variables={queryVariables}
        className="!mx-4 !w-auto"
      />
    </FeedPageLayoutComponent>
  );
};

TagPage.getLayout = getLayout;
TagPage.layoutProps = mainFeedLayoutProps;

export default TagPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface TagPageParams extends ParsedUrlQuery {
  tag: string;
}

const getSeoData = (
  title: string,
  description = `Find all the recent posts, videos, updates and discussions about ${title}`,
): NextSeoProps => {
  const seoTitles = getPageSeoTitles(`${title} posts`);

  return {
    ...defaultSeo,
    ...seoTitles,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
    },
    description,
  };
};

export async function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): Promise<
  GetStaticPropsResult<TagPageProps>
> {
  const tag = params?.tag;
  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }

  const notFoundResponse = {
    revalidate: 3600,
    props: {
      tag,
      initialData: null,
      topPosts: [],
      recommendedTags: [],
      topContributors: [],
      topSources: [],
      seo: getSeoData(tag),
    },
  };

  try {
    const [
      keywordResult,
      topPostsResult,
      recommendedTagsResult,
      topContributorsResult,
      topSourcesResult,
    ] = await Promise.all([
      gqlClient.request<{ keyword: Keyword }>(KEYWORD_QUERY, {
        value: tag,
      }),
      gqlClient
        .request<TopPostsData>(TAG_TOP_POSTS_QUERY, {
          tag,
          first: 10,
        })
        .catch(() => null),
      gqlClient
        .request<{ recommendedTags: TagsData }>(GET_RECOMMENDED_TAGS_QUERY, {
          tags: [tag],
          excludedTags: [],
        })
        .catch(() => null),
      gqlClient
        .request<{ topCreatorsByTag: UserShortProfile[] }>(
          TOP_CREATORS_BY_TAG_QUERY,
          {
            tag,
            limit: 6,
          },
        )
        .catch(() => null),
      gqlClient
        .request<{ sourcesByTag: Connection<Source> }>(SOURCES_BY_TAG_QUERY, {
          tag,
          first: 6,
        })
        .catch(() => null),
    ]);

    if (!keywordResult?.keyword) {
      return notFoundResponse;
    }

    const initialData = keywordResult.keyword;
    const topPosts =
      topPostsResult?.page?.edges
        ?.map((edge) => edge.node)
        .filter((post) => !!post.title) ?? [];
    const recommendedTags = recommendedTagsResult?.recommendedTags?.tags ?? [];
    const topContributors = topContributorsResult?.topCreatorsByTag ?? [];
    const topSources =
      topSourcesResult?.sourcesByTag?.edges?.map((edge) => edge.node) ?? [];
    const seo = getSeoData(
      initialData.flags?.title || tag,
      initialData.flags?.description,
    );

    return {
      props: {
        seo,
        initialData,
        tag,
        topPosts,
        recommendedTags,
        topContributors,
        topSources,
      },
      revalidate: 3600,
    };
  } catch (error) {
    // Return fallback props for any request failure in getStaticProps.
    return notFoundResponse;
  }
}
