import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import {
  BlockIcon,
  DiscussIcon,
  HashtagIcon,
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
} from '@dailydotdev/shared/src/hooks';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SOURCES_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/sources';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { RelatedSources } from '@dailydotdev/shared/src/components/RelatedSources';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { cloudinarySourceRoadmap } from '@dailydotdev/shared/src/lib/image';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import CustomFeedOptionsMenu from '@dailydotdev/shared/src/components/CustomFeedOptionsMenu';
import { useContentPreference } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import type { DynamicSeoProps } from '../../components/common';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

interface TagPageProps extends DynamicSeoProps {
  tag: string;
  initialData: Keyword | null;
  topPosts: TagTopPost[];
  recommendedTags: TagsData['tags'];
}

interface TagTopPost {
  id: string;
  title?: string;
  slug?: string;
}

interface TagTopPostsData {
  page?: {
    edges?: {
      node: TagTopPost;
    }[];
  };
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
    <RelatedSources
      isLoading={isPending}
      sources={sources}
      title="🔔 Top sources covering it"
      className="mx-4"
    />
  );
};

const TagPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
}: TagPageProps): ReactElement => {
  const { isFallback, push, query } = useRouter();
  const showRoadmap = useFeature(feature.showRoadmap);
  const { user, showLogin } = useContext(AuthContext);
  const mostUpvotedQueryVariables = useMemo(
    () => ({
      tag,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
      period: 30,
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
      ],
    }),
    [tag],
  );
  const bestDiscussedQueryVariables = useMemo(
    () => ({
      tag,
    }),
    [tag],
  );
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag, ranking: 'TIME' }), [tag]);
  const { feedSettings } = useFeedSettings();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: Origin.TagPage });
  const title = initialData?.flags?.title || tag;
  const { follow, unfollow } = useContentPreference({
    showToastOnSuccess: false,
  });

  const tagStatus = useMemo(() => {
    if (!feedSettings) {
      return 'unfollowed';
    }
    if (
      feedSettings.blockedTags?.findIndex((blockedTag) => tag === blockedTag) >
      -1
    ) {
      return 'blocked';
    }
    if (
      feedSettings.includeTags?.findIndex(
        (includedTag) => tag === includedTag,
      ) > -1
    ) {
      return 'followed';
    }
    return 'unfollowed';
  }, [feedSettings, tag]);

  if (isFallback) {
    const fallbackTag = typeof query.tag === 'string' ? query.tag : tag;
    return (
      <FeedPageLayoutComponent>
        <PageInfoHeader className="mx-4 !w-auto">
          <div className="flex items-center font-bold">
            <HashtagIcon size={IconSize.XXLarge} />
            <h1 className="ml-2 w-fit typo-title2">{fallbackTag}</h1>
          </div>
        </PageInfoHeader>
      </FeedPageLayoutComponent>
    );
  }

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

  return (
    <FeedPageLayoutComponent>
      <PageInfoHeader className="mx-4 !w-auto">
        <div className="flex items-center font-bold">
          <HashtagIcon size={IconSize.XXLarge} />
          <h1 className="ml-2 w-fit typo-title2">{title}</h1>
        </div>
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
        {initialData?.flags?.description && (
          <p className="typo-body">{initialData?.flags?.description}</p>
        )}
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
        {tag && (
          <TagRecommendedTags
            tag={tag}
            blockedTags={feedSettings?.blockedTags}
            initialTags={recommendedTags}
          />
        )}
        {showRoadmap && initialData?.flags?.roadmap && (
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
                <p className="text-text-tertiary typo-footnote">
                  By roadmap.sh
                </p>
              </div>
              <Button
                icon={<OpenLinkIcon />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
              />
            </a>
          </Link>
        )}
      </PageInfoHeader>
      <TagTopSources tag={tag} />
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
  return { paths: [], fallback: true };
}

interface TagPageParams extends ParsedUrlQuery {
  tag: string;
}

const getSeoData = (
  title: string,
  description = `Find all the recent posts, videos, updates and discussions about ${title}`,
): NextSeoProps => ({
  title: `${title} posts on daily.dev`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  description,
});

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
      seo: getSeoData(tag),
    },
  };

  try {
    const [keywordResult, topPostsResult, recommendedTagsResult] =
      await Promise.all([
        gqlClient.request<{ keyword: Keyword }>(KEYWORD_QUERY, {
          value: tag,
        }),
        gqlClient
          .request<TagTopPostsData>(TAG_TOP_POSTS_QUERY, {
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
      },
      revalidate: 3600,
    };
  } catch (error) {
    // Return fallback props for any request failure in getStaticProps.
    return notFoundResponse;
  }
}
