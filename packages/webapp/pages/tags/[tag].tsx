import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import {
  BlockIcon,
  DiscussIcon,
  HashtagIcon,
  InfoIcon,
  MedalBadgeIcon,
  MiniCloseIcon as XIcon,
  OpenLinkIcon,
  PlusIcon,
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
import type { ButtonProps } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PageInfoHeader } from '@dailydotdev/shared/src/components/utilities';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  OtherFeedPage,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useQuery } from '@tanstack/react-query';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { GET_RECOMMENDED_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  ReferralCampaignKey,
  useFeedLayout,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
import { RelatedEntities } from '@dailydotdev/shared/src/components/RelatedEntities';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import {
  feature,
  featureTagPageRedesign,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { cloudinarySourceRoadmap } from '@dailydotdev/shared/src/lib/image';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
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
import { getPageSeoTitles } from '../../components/layouts/utils';
import { TagPageHeader } from '../../components/tags/TagPageHeader';
import { TagBestOfPosts } from '../../components/tags/TagBestOfPosts';
import { TagBuildYourFeed } from '../../components/tags/TagBuildYourFeed';
import { TagPeople } from '../../components/tags/TagPeople';
import { TagSectionHeader } from '../../components/tags/TagSectionHeader';
import { TagKeyFacts } from '../../components/tags/TagKeyFacts';
import { TagFaq } from '../../components/tags/TagFaq';
import type { TagFaqItem } from '../../components/tags/tagContent';
import { getTagFaqItems } from '../../components/tags/tagContent';
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
}

interface TagRecommendedTagsProps {
  tag: string;
  blockedTags?: string[];
  initialTags?: TagsData['tags'];
}

const TagRecommendedTags = ({
  tag,
  blockedTags,
  initialTags = [],
}: TagRecommendedTagsProps): ReactElement => {
  const { data: recommendedTags, isPending } = useQuery({
    queryKey: [RequestKey.RecommendedTags, null, tag],

    queryFn: async () =>
      await gqlClient.request<{
        recommendedTags: TagsData;
      }>(GET_RECOMMENDED_TAGS_QUERY, {
        tags: [tag],
        excludedTags: blockedTags || [],
      }),
    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const tags = recommendedTags?.recommendedTags?.tags ?? initialTags;

  return (
    <RecommendedTags
      isLoading={isPending && initialTags.length === 0}
      tags={tags}
    />
  );
};

const TagTopSources = ({ tag }: { tag: string }) => {
  const { data: topSources, isPending } = useQuery({
    queryKey: [RequestKey.SourceByTag, null, tag],

    queryFn: async () =>
      await gqlClient.request<{ sourcesByTag: Connection<Source> }>(
        SOURCES_BY_TAG_QUERY,
        {
          tag,
          first: 6,
        },
      ),

    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const sources = topSources?.sourcesByTag?.edges?.map((edge) => edge.node);
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <RelatedEntities
      isLoading={isPending}
      items={sources.map((source) => ({
        id: source.id,
        image: source.image,
        imageAlt: `${source.name} logo`,
        name: source.name,
        permalink: source.permalink,
      }))}
      title="🔔 Top sources covering it"
      className="mx-4"
    />
  );
};

const TagTopContributors = ({
  tag,
  initialUsers = [],
}: {
  tag: string;
  initialUsers?: UserShortProfile[];
}): ReactElement | null => {
  const { data: topContributors, isPending } = useQuery({
    queryKey: [RequestKey.TopCreatorsByTag, null, tag],

    queryFn: async () =>
      await gqlClient.request<{ topCreatorsByTag: UserShortProfile[] }>(
        TOP_CREATORS_BY_TAG_QUERY,
        {
          tag,
          limit: 6,
        },
      ),

    enabled: !!tag,
    staleTime: StaleTime.OneHour,
  });

  const users = topContributors?.topCreatorsByTag ?? initialUsers;

  return (
    <RelatedEntities
      isLoading={isPending && initialUsers.length === 0}
      items={users.map((user) => ({
        id: user.id,
        image: user.image,
        imageAlt: `${user.name} avatar`,
        name: user.name,
        permalink: user.permalink,
      }))}
      title="👥 Top contributors"
      className="mx-4"
    />
  );
};

const getTagPageJsonLd = ({
  tag,
  initialData,
  topPosts,
  faqItems,
}: {
  tag: string;
  initialData: Keyword;
  topPosts: TopPost[];
  faqItems: TagFaqItem[];
}): string => {
  const encodedTag = encodeURIComponent(tag);
  const tagTitle = initialData.flags?.title || tag;
  const tagDescription =
    initialData.flags?.description ||
    `Find all the recent posts, videos, updates and discussions about ${tagTitle}`;
  const tagUrl = `${appOrigin}/tags/${encodedTag}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${tagUrl}#page`,
        url: tagUrl,
        name: `${tagTitle} posts on daily.dev`,
        description: tagDescription,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
        about: { '@id': `${tagUrl}#term` },
      },
      {
        '@type': 'DefinedTerm',
        '@id': `${tagUrl}#term`,
        name: tagTitle,
        description: tagDescription,
        url: tagUrl,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'daily.dev tags',
          url: `${appOrigin}/tags`,
        },
      },
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
}: TagPageProps): ReactElement => {
  const { push } = useRouter();
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
  const faqItems: TagFaqItem[] = useMemo(
    () =>
      getTagFaqItems({
        title,
        topContributors,
        recommendedTags,
        roadmap: initialData?.flags?.roadmap,
      }),
    [title, initialData, topContributors, recommendedTags],
  );
  const jsonLd = initialData
    ? getTagPageJsonLd({ tag, initialData, topPosts, faqItems })
    : null;
  const { follow, unfollow } = useContentPreference({
    showToastOnSuccess: false,
  });

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

  const followButtonProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
    icon: tagStatus === 'followed' ? <XIcon /> : <PlusIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'followed') {
          await onUnfollowTags({ tags: [tag] });
        } else {
          await onFollowTags({ tags: [tag] });
        }
      } else {
        showLogin({ trigger: AuthTriggers.Filter });
      }
    },
  };

  const blockButtonProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
    icon: tagStatus === 'blocked' ? <XIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'blocked') {
          await onUnblockTags({ tags: [tag] });
        } else {
          await onBlockTags({ tags: [tag] });
        }
      } else {
        showLogin({ trigger: AuthTriggers.Filter });
      }
    },
  };

  const isRedesign = useFeature(featureTagPageRedesign);
  const { shouldShowAuthBanner } = useOnboardingActions();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLoggedIn = !!user;

  const onGetFeed = (): void => {
    if (user) {
      push(
        `/feeds/new?entityId=${tag}&entityType=${ContentPreferenceType.Keyword}`,
      );
      return;
    }
    // Anonymous: capture intent now, convert via the auth flow. Seeding the new
    // feed with the selected topics post-signup is a backend follow-up.
    showLogin({ trigger: AuthTriggers.Filter });
  };

  const headerActions = (
    <div className="flex flex-row gap-3">
      {tagStatus !== 'blocked' && (
        <Button
          variant={ButtonVariant.Primary}
          {...followButtonProps}
          aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
        >
          {tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
        </Button>
      )}
      {tagStatus !== 'followed' && (
        <Button
          variant={ButtonVariant.Float}
          {...blockButtonProps}
          aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
        >
          {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
        </Button>
      )}
      <CustomFeedOptionsMenu
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
    </div>
  );

  // Crawlable links preserved verbatim for SEO in both layouts.
  const seoLinks = (
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
    </>
  );

  const roadmapNode =
    showRoadmap && initialData?.flags?.roadmap ? (
      <Link href={initialData.flags.roadmap} passHref prefetch={false}>
        <a
          target="_blank"
          rel={anchorDefaultRel}
          className="mr-auto flex w-auto cursor-pointer items-center rounded-12 border border-border-subtlest-tertiary p-4"
        >
          <img
            src={cloudinarySourceRoadmap}
            alt="roadmap.sh logo"
            className="size-10 rounded-full"
          />
          <div className="mx-3 flex-1">
            <p className="font-bold typo-callout">
              Comprehensive roadmap for {tag}
            </p>
            <p className="text-text-tertiary typo-footnote">By roadmap.sh</p>
          </div>
          <Button
            icon={<OpenLinkIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </a>
      </Link>
    ) : null;

  const jsonLdHead = jsonLd ? (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </Head>
  ) : null;

  const breadcrumbs = (
    <ArchiveBreadcrumbs
      items={[{ label: 'Tags', href: '/tags' }, { label: title }]}
      className="mx-4"
    />
  );

  const relatedEntities = (
    <>
      <TagTopSources tag={tag} />
      <TagTopContributors tag={tag} initialUsers={topContributors} />
    </>
  );

  const archiveCard = (
    <ArchiveEntryCard
      scopeType={ArchiveScopeType.Tag}
      scopeId={tag}
      scopeName={title}
      className="mx-4 mb-6 laptop:mx-4"
    />
  );

  const allPostsFeed = (
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
  );

  // Redesign-only sections, composed with a shared section rhythm.
  const buildLoggedInRelatedTopics = () => (
    <section className="flex scroll-mt-16 flex-col gap-3">
      <TagSectionHeader
        icon={<HashtagIcon size={IconSize.Medium} secondary />}
        title="Related topics"
        subtitle="Tags developers follow alongside this one."
      />
      <div className="mx-4">
        <TagRecommendedTags
          tag={tag}
          blockedTags={feedSettings?.blockedTags}
          initialTags={recommendedTags}
        />
      </div>
    </section>
  );

  let relatedTopicsSection: ReactElement | null = null;
  if (tag && !isLoggedIn) {
    relatedTopicsSection = (
      <TagBuildYourFeed
        tag={tag}
        relatedTags={recommendedTags}
        onCreateFeed={onGetFeed}
      />
    );
  } else if (tag) {
    relatedTopicsSection = buildLoggedInRelatedTopics();
  }

  const learnSection = roadmapNode ? (
    <section className="flex scroll-mt-16 flex-col gap-3">
      <TagSectionHeader
        icon={<MedalBadgeIcon size={IconSize.Medium} secondary />}
        title={`Learn ${tag}`}
        subtitle="A structured path to go from curious to confident."
      />
      <div className="mx-4">{roadmapNode}</div>
    </section>
  ) : null;

  const overviewSection = initialData?.flags?.description ? (
    <section className="flex scroll-mt-16 flex-col gap-2">
      <TagSectionHeader
        icon={<InfoIcon size={IconSize.Medium} secondary />}
        title={`What is ${title}?`}
      />
      <p className="mx-4 max-w-3xl text-text-secondary typo-body">
        {initialData.flags.description}
      </p>
    </section>
  ) : null;

  if (isRedesign) {
    return (
      <FeedPageLayoutComponent>
        {jsonLdHead}
        <div className="flex w-full flex-col gap-8 pb-10">
          {breadcrumbs}
          <TagPageHeader
            title={title}
            isLoggedIn={isLoggedIn}
            actions={headerActions}
            sponsoredHero={<SponsoredTagHero tag={tag} />}
            onGetFeed={onGetFeed}
          >
            {seoLinks}
          </TagPageHeader>
          <div className="mx-4">
            <TagKeyFacts
              occurrences={initialData?.occurrences}
              relatedTopicsCount={recommendedTags.length}
              contributorsCount={topContributors.length}
              createdAt={initialData?.createdAt}
            />
          </div>
          {overviewSection}
          {relatedTopicsSection}
          <TagBestOfPosts tag={tag} userId={user?.id} />
          <TagPeople tag={tag} initialContributors={topContributors} />
          {learnSection}
          <TagFaq tag={title} items={faqItems} />
          <section id="all-posts" className="flex scroll-mt-16 flex-col gap-3">
            <TagSectionHeader
              icon={<HashtagIcon size={IconSize.Medium} secondary />}
              title={`All posts about ${tag}`}
              subtitle="Every recent post, video, and discussion — newest first."
            />
            {archiveCard}
            {allPostsFeed}
          </section>
          {shouldShowAuthBanner && isLaptop && <AuthenticationBanner />}
        </div>
      </FeedPageLayoutComponent>
    );
  }

  return (
    <FeedPageLayoutComponent>
      {jsonLdHead}
      {breadcrumbs}
      <PageInfoHeader className={classNames('mx-4 !w-auto')}>
        <SponsoredTagHero tag={tag} />
        <div className="flex items-center font-bold">
          <HashtagIcon size={IconSize.XXLarge} />
          <h1 className="ml-2 w-fit typo-title2">{title}</h1>
        </div>
        {headerActions}
        {initialData?.flags?.description && (
          <p className="typo-body">{initialData?.flags?.description}</p>
        )}
        {seoLinks}
        {tag && (
          <TagRecommendedTags
            tag={tag}
            blockedTags={feedSettings?.blockedTags}
            initialTags={recommendedTags}
          />
        )}
        {roadmapNode}
      </PageInfoHeader>
      {relatedEntities}
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
          className="laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
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
          className="laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
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
          className="laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
      {archiveCard}
      <div className="mx-4 mb-5 flex w-auto items-center">
        <p className="flex items-center font-bold typo-body">
          All posts about {tag}
        </p>
      </div>
      {allPostsFeed}
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
      seo: getSeoData(tag),
    },
  };

  try {
    const [
      keywordResult,
      topPostsResult,
      recommendedTagsResult,
      topContributorsResult,
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
      },
      revalidate: 3600,
    };
  } catch (error) {
    // Return fallback props for any request failure in getStaticProps.
    return notFoundResponse;
  }
}
