import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { SearchIcon } from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { SourceSpotlightPost } from '../../../graphql/search';
import { sourceSpotlightPostsQueryOptions } from '../../../graphql/search';
import { getPostTitle } from '../../../graphql/posts';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import {
  SpotlightGroup,
  type SpotlightCommand,
  type SpotlightSource,
} from '../types';

const LATEST_POSTS_LIMIT = 5;

interface UseSpotlightSourcePostsProps {
  router: Pick<NextRouter, 'push'>;
  source: SpotlightSource | null;
  enabled: boolean;
}

export interface SpotlightSourcePosts {
  pinned: SpotlightCommand[];
  latest: SpotlightCommand[];
  isLoading: boolean;
}

const buildSourcePostCommand = (
  post: SourceSpotlightPost,
  source: SpotlightSource,
  router: UseSpotlightSourcePostsProps['router'],
): SpotlightCommand => {
  const date = post.createdAt
    ? formatDate({ value: post.createdAt, type: TimeFormatType.Post })
    : '';

  return {
    id: `search.source-post.${post.id}`,
    title: getPostTitle(post) ?? '',
    icon: SearchIcon,
    group: SpotlightGroup.Search,
    meta: {
      kind: 'post',
      sourceImage: post.image || post.sharedPost?.image || source.image,
      sourceName: [post.author?.name, date].filter(Boolean).join(' · '),
    },
    perform: () => {
      router.push(`${webappUrl}posts/${post.id}`);
    },
  };
};

/**
 * What a squad scoped Spotlight lists before anything is typed: the squad's
 * pinned posts, then its latest ones.
 */
export const useSpotlightSourcePosts = ({
  router,
  source,
  enabled,
}: UseSpotlightSourcePostsProps): SpotlightSourcePosts => {
  const { user } = useAuthContext();
  const isEnabled = enabled && !!source;
  const { data, isPending } = useQuery({
    ...sourceSpotlightPostsQueryOptions({ user, sourceId: source?.id ?? '' }),
    enabled: isEnabled,
  });

  return useMemo(() => {
    if (!source || !data) {
      return { pinned: [], latest: [], isLoading: isEnabled && isPending };
    }

    const toCommand = (post: SourceSpotlightPost) =>
      buildSourcePostCommand(post, source, router);

    return {
      pinned: data.filter((post) => !!post.pinnedAt).map(toCommand),
      latest: data
        .filter((post) => !post.pinnedAt)
        .slice(0, LATEST_POSTS_LIMIT)
        .map(toCommand),
      isLoading: false,
    };
  }, [source, data, router, isEnabled, isPending]);
};
