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
import { FeedPage } from '@dailydotdev/shared/src/components/utilities';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import {
  KEYWORD_QUERY,
  Keyword,
} from '@dailydotdev/shared/src/graphql/keywords';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TagLink } from '@dailydotdev/shared/src/components/TagLinks';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import {
  GET_RECOMMENDED_TAGS_QUERY,
  TagsData,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

type TagPageProps = { tag: string; initialData: Keyword };

const RecommendedTags = ({ tag, blockedTags }): ReactElement => {
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
    },
  );

  if (isLoading) {
    return (
      <div>
        <ElementPlaceholder className="mb-3 h-4 w-1/5 rounded-12" />
        <div className="flex gap-2">
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
        </div>
      </div>
    );
  }

  return (
    <>
      {recommendedTags?.recommendedTags?.tags.length > 0 && (
        <div>
          <p className="mb-3 text-text-tertiary typo-caption1">Related tags:</p>
          <div className="flex gap-2">
            {recommendedTags?.recommendedTags?.tags.map((relatedTag) => (
              <TagLink key={relatedTag.name} tag={relatedTag.name} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const TagPage = ({ tag, initialData }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag, ranking: 'TIME' }), [tag]);
  const { feedSettings } = useFeedSettings();
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
    description: initialData?.flags?.description || defaultSeo.description,
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
    <FeedPage>
      <NextSeo {...seo} />
      <div className="mb-10 flex w-full flex-col gap-5 rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="flex items-center font-bold">
          <HashtagIcon size={IconSize.XXLarge} />
          <h1 className="ml-2 typo-title2">{title}</h1>
        </div>
        <div className="flex flex-row gap-3">
          {tagStatus !== 'blocked' && (
            <Button variant={ButtonVariant.Primary} {...followButtonProps}>
              {tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
            </Button>
          )}
          {tagStatus !== 'followed' && (
            <Button variant={ButtonVariant.Float} {...blockButtonProps}>
              {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
            </Button>
          )}
        </div>
        {initialData?.flags?.description && (
          <p className="typo-body">{initialData?.flags?.description}</p>
        )}
        {tag && (
          <RecommendedTags tag={tag} blockedTags={feedSettings?.blockedTags} />
        )}
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
      />
    </FeedPage>
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
