import { useMemo } from 'react';
import type { NextRouter } from 'next/router';
import { HashtagIcon, SearchIcon, SourceIcon, UserIcon } from '../../icons';
import {
  SearchProviderEnum,
  getSearchUrl,
  type SearchSuggestion,
} from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { webappUrl } from '../../../lib/constants';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface SearchCommandsContext {
  router: Pick<NextRouter, 'push'>;
  query: string;
}

export interface SpotlightSearchCommands {
  isLoading: boolean;
  posts: SpotlightCommand[];
  tags: SpotlightCommand[];
  sources: SpotlightCommand[];
  users: SpotlightCommand[];
  /** Always-on fallthrough rows, shown even while suggestions are loading. */
  fallthrough: SpotlightCommand[];
}

const buildPostCommand = (
  hit: SearchSuggestion,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.post.${hit.id ?? hit.title}`,
  title: hit.title,
  subtitle: hit.subtitle,
  icon: SearchIcon,
  group: SpotlightGroup.Search,
  perform: () => {
    if (hit.id) {
      router.push(`${webappUrl}posts/${hit.id}`);
      return;
    }
    router.push(
      getSearchUrl({ query: hit.title, provider: SearchProviderEnum.Posts }),
    );
  },
});

const buildTagCommand = (
  hit: SearchSuggestion,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.tag.${hit.id ?? hit.title}`,
  title: `#${hit.title}`,
  subtitle: hit.subtitle,
  icon: HashtagIcon,
  group: SpotlightGroup.Search,
  perform: () => {
    router.push(`${webappUrl}tags/${hit.title}`);
  },
});

const buildSourceCommand = (
  hit: SearchSuggestion,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.source.${hit.id ?? hit.title}`,
  title: hit.title,
  subtitle: hit.subtitle ?? 'Source',
  icon: SourceIcon,
  group: SpotlightGroup.Search,
  perform: () => {
    if (!hit.id) {
      return;
    }
    router.push(`${webappUrl}sources/${hit.id}`);
  },
});

const buildUserCommand = (
  hit: SearchSuggestion,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.user.${hit.id ?? hit.title}`,
  title: hit.title,
  subtitle: hit.subtitle,
  icon: UserIcon,
  group: SpotlightGroup.Search,
  perform: () => {
    if (!hit.subtitle) {
      return;
    }
    // `subtitle` carries the @username for user suggestions.
    const handle = hit.subtitle.startsWith('@')
      ? hit.subtitle.slice(1)
      : hit.subtitle;
    router.push(`${webappUrl}${handle}`);
  },
});

/**
 * Always-on rows that act as the no-results escape hatch and explicit
 * search-provider entry points. Visible whenever there's a query.
 */
const buildFallthrough = (
  query: string,
  router: SearchCommandsContext['router'],
): SpotlightCommand[] => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  return [
    {
      id: 'search.fallthrough.posts',
      title: `Search posts for "${trimmed}"`,
      icon: SearchIcon,
      group: SpotlightGroup.Search,
      perform: () => {
        router.push(
          getSearchUrl({ query: trimmed, provider: SearchProviderEnum.Posts }),
        );
      },
    },
  ];
};

export const useSpotlightSearchCommands = ({
  router,
  query,
}: SearchCommandsContext): SpotlightSearchCommands => {
  const trimmed = query.trim();

  const { suggestions: postHits, isLoading: postsLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Posts,
      query: trimmed,
    });
  const { suggestions: tagHits, isLoading: tagsLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Tags,
      query: trimmed,
    });
  const { suggestions: sourceHits, isLoading: sourcesLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Sources,
      query: trimmed,
    });
  const { suggestions: userHits, isLoading: usersLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Users,
      query: trimmed,
    });

  return useMemo(() => {
    return {
      isLoading:
        !!trimmed &&
        (postsLoading || tagsLoading || sourcesLoading || usersLoading),
      posts: (postHits?.hits ?? []).map((hit) => buildPostCommand(hit, router)),
      tags: (tagHits?.hits ?? []).map((hit) => buildTagCommand(hit, router)),
      sources: (sourceHits?.hits ?? []).map((hit) =>
        buildSourceCommand(hit, router),
      ),
      users: (userHits?.hits ?? []).map((hit) => buildUserCommand(hit, router)),
      fallthrough: buildFallthrough(trimmed, router),
    };
  }, [
    trimmed,
    router,
    postHits,
    postsLoading,
    tagHits,
    tagsLoading,
    sourceHits,
    sourcesLoading,
    userHits,
    usersLoading,
  ]);
};
