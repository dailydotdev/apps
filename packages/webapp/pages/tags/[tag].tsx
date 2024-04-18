import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import {
  BlockIcon,
  HashtagIcon,
  MiniCloseIcon as XIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { TAG_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonProps,
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
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import {
  KEYWORD_QUERY,
  Keyword,
} from '@dailydotdev/shared/src/graphql/keywords';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
  GET_RECOMMENDED_TAGS_QUERY,
  TagsData,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
import {
  SOURCES_BY_TAG_QUERY,
  Source,
} from '@dailydotdev/shared/src/graphql/sources';
import { Connection } from '@dailydotdev/shared/src/graphql/common';
import { RelatedSources } from '@dailydotdev/shared/src/components/RelatedSources';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

type TagPageProps = { tag: string; initialData: Keyword };

const TagRecommendedTags = ({ tag, blockedTags }): ReactElement => {
  const { data: recommendedTags, isLoading } = useQuery(
    [RequestKey.RecommendedTags, null, tag],
    async () =>
      await request<{
        recommendedTags: TagsData;
      }>(graphqlUrl, GET_RECOMMENDED_TAGS_QUERY, {
        tags: [tag],
        excludedTags: blockedTags || [],
      }),
    {
      enabled: !!tag,
      staleTime: StaleTime.OneHour,
    },
  );

  return (
    <RecommendedTags
      isLoading={isLoading}
      tags={recommendedTags?.recommendedTags?.tags}
    />
  );
};

const TagTopSources = ({ tag }: { tag: string }) => {
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const { data: topSources, isLoading } = useQuery(
    [RequestKey.SourceByTag, null, tag],
    async () =>
      await request<{ sourcesByTag: Connection<Source> }>(
        graphqlUrl,
        SOURCES_BY_TAG_QUERY,
        {
          tag,
          first: 6,
        },
      ),
    {
      enabled: !!tag,
      staleTime: StaleTime.OneHour,
    },
  );

  const sources = topSources?.sourcesByTag?.edges?.map((edge) => edge.node);
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <RelatedSources
      isLoading={isLoading}
      sources={sources}
      title="🔔 Top sources covering it"
      className={shouldUseMobileFeedLayout && 'mx-4'}
    />
  );
};

const TagPage = ({ tag, initialData }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag, ranking: 'TIME' }), [tag]);
  const { feedSettings } = useFeedSettings();
  const { shouldUseMobileFeedLayout, FeedPageLayoutComponent } =
    useFeedLayout();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: Origin.TagPage });
  const title = initialData?.flags?.title || tag;

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
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `${title} posts on daily.dev`,
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
    description:
      initialData?.flags?.description ||
      `Find all the recent posts, videos, updates and discussions about ${title}`,
  };

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
      <NextSeo {...seo} />
      <PageInfoHeader className={shouldUseMobileFeedLayout && 'mx-4 !w-auto'}>
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
        </div>
        {initialData?.flags?.description && (
          <p className="typo-body">{initialData?.flags?.description}</p>
        )}
        {tag && (
          <TagRecommendedTags
            tag={tag}
            blockedTags={feedSettings?.blockedTags}
          />
        )}
      </PageInfoHeader>
      <TagTopSources tag={tag} />
      <Feed
        feedName={OtherFeedPage.Tag}
        feedQueryKey={[
          'tagFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={TAG_FEED_QUERY}
        variables={queryVariables}
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

export async function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): Promise<
  GetStaticPropsResult<TagPageProps>
> {
  let initialData: Keyword | null = null;

  try {
    const result = await request<{ keyword: Keyword }>(
      graphqlUrl,
      KEYWORD_QUERY,
      {
        value: params.tag,
      },
    );

    if (result.keyword) {
      initialData = result.keyword;
    }
  } catch (error) {
    // keyword not found, ignoring for now
  }

  return {
    props: {
      tag: params.tag,
      initialData,
    },
    revalidate: 3600,
  };
}
