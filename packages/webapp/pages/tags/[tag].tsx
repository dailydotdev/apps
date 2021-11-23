import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import HashtagIcon from '@dailydotdev/shared/icons/hashtag.svg';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import BlockIcon from '@dailydotdev/shared/icons/block.svg';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { TAG_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CustomFeedHeader,
  customFeedIcon,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';

type TagPageProps = { tag: string };

const TagPage = ({ tag }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag, ranking: 'TIME' }), [tag]);
  const { feedSettings } = useFeedSettings();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({ origin: 'tag page' });

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
    title: `${tag} posts on daily.dev`,
    titleTemplate: '%s',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  const followButtonProps = {
    icon: tagStatus === 'followed' ? <XIcon /> : <PlusIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'followed') {
          await onUnfollowTags({ tags: [tag] });
        } else {
          await onFollowTags({ tags: [tag] });
        }
      } else {
        showLogin('filter');
      }
    },
  };

  const blockButtonProps = {
    icon: tagStatus === 'blocked' ? <XIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'blocked') {
          await onUnblockTags({ tags: [tag] });
        } else {
          await onBlockTags({ tags: [tag] });
        }
      } else {
        showLogin('filter');
      }
    },
  };

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader>
        <HashtagIcon className={customFeedIcon} />
        <span className="mr-auto">{tag}</span>
        {tagStatus !== 'followed' && (
          <>
            <Button
              {...blockButtonProps}
              buttonSize="small"
              className="laptop:hidden btn-secondary"
              aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
            />
            <Button
              className="hidden laptop:flex btn-secondary"
              buttonSize="small"
              {...blockButtonProps}
            >
              {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
            </Button>
          </>
        )}
        {tagStatus !== 'blocked' && (
          <>
            <Button
              className={classNames(
                'btn-secondary laptop:hidden',
                tagStatus !== 'followed' && 'ml-4',
              )}
              {...followButtonProps}
              buttonSize="small"
              aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
            />
            <Button
              className={classNames(
                'btn-secondary hidden laptop:flex',
                tagStatus !== 'followed' && 'ml-4',
              )}
              {...followButtonProps}
              buttonSize="small"
            >
              {tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
            </Button>
          </>
        )}
      </CustomFeedHeader>
      <Feed
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

export function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): GetStaticPropsResult<TagPageProps> {
  return {
    props: {
      tag: params.tag,
    },
  };
}
