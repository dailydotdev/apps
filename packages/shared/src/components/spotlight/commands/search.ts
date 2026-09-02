import { useMemo } from 'react';
import type { NextRouter } from 'next/router';
import { HashtagIcon, OpenLinkIcon, SearchIcon } from '../../icons';
import {
  SearchProviderEnum,
  getSearchUrl,
  minSearchQueryLength,
  type SearchSuggestion,
} from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { webappUrl } from '../../../lib/constants';
import { getTagPageLink } from '../../../lib/links';
import {
  SpotlightGroup,
  SpotlightScope,
  type SpotlightCommand,
} from '../types';

interface SearchCommandsContext {
  router: Pick<NextRouter, 'push'>;
  query: string;
  scope?: SpotlightScope;
}

export interface SpotlightSearchCommands {
  /** True while any provider relevant to the active scope is still loading. */
  isLoading: boolean;
  posts: SpotlightCommand[];
  postsLoading: boolean;
  tags: SpotlightCommand[];
  tagsLoading: boolean;
  sources: SpotlightCommand[];
  sourcesLoading: boolean;
  users: SpotlightCommand[];
  usersLoading: boolean;
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
  meta: {
    kind: 'post',
    sourceImage: hit.image,
    sourceName: hit.subtitle,
  },
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
  title: hit.title,
  subtitle: hit.subtitle,
  icon: HashtagIcon,
  group: SpotlightGroup.Search,
  meta: { kind: 'tag', tagName: hit.title },
  perform: () => {
    // `id` is the normalized tag value; `title` is the humanized label and
    // would 404 the tag page, so navigate with the normalized value.
    router.push(getTagPageLink(hit.id ?? hit.title));
  },
});

const buildSourceCommand = (
  hit: SearchSuggestion,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.source.${hit.id ?? hit.title}`,
  title: hit.title,
  subtitle: hit.subtitle,
  icon: SearchIcon,
  group: SpotlightGroup.Search,
  meta: {
    kind: 'source',
    image: hit.image,
    handle: hit.subtitle,
  },
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
  icon: SearchIcon,
  group: SpotlightGroup.Search,
  meta: {
    kind: 'user',
    image: hit.image,
    handle: hit.subtitle,
  },
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

type SeeAllScope = Exclude<
  SpotlightScope,
  SpotlightScope.All | SpotlightScope.Actions
>;

const seeAllProvider: Record<SeeAllScope, SearchProviderEnum> = {
  [SpotlightScope.Posts]: SearchProviderEnum.Posts,
  [SpotlightScope.Squads]: SearchProviderEnum.Sources,
  [SpotlightScope.People]: SearchProviderEnum.Users,
  [SpotlightScope.Tags]: SearchProviderEnum.Tags,
};

const seeAllLabel: Record<SeeAllScope, string> = {
  [SpotlightScope.Posts]: 'posts',
  [SpotlightScope.Squads]: 'squads',
  [SpotlightScope.People]: 'people',
  [SpotlightScope.Tags]: 'tags',
};

const buildSeeAllCommand = (
  scope: SeeAllScope,
  query: string,
  router: SearchCommandsContext['router'],
): SpotlightCommand => ({
  id: `search.see-all.${scope}`,
  title: `See all ${seeAllLabel[scope]} for "${query}"`,
  icon: OpenLinkIcon,
  group: SpotlightGroup.Search,
  meta: { kind: 'see-all', scope },
  perform: () => {
    router.push(getSearchUrl({ query, provider: seeAllProvider[scope] }));
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

const scopeProviders: Record<SpotlightScope, SearchProviderEnum[]> = {
  [SpotlightScope.All]: [
    SearchProviderEnum.Posts,
    SearchProviderEnum.Tags,
    SearchProviderEnum.Sources,
    SearchProviderEnum.Users,
  ],
  [SpotlightScope.Actions]: [],
  [SpotlightScope.Posts]: [SearchProviderEnum.Posts],
  [SpotlightScope.Squads]: [SearchProviderEnum.Sources],
  [SpotlightScope.People]: [SearchProviderEnum.Users],
  [SpotlightScope.Tags]: [SearchProviderEnum.Tags],
};

export const useSpotlightSearchCommands = ({
  router,
  query,
  scope = SpotlightScope.All,
}: SearchCommandsContext): SpotlightSearchCommands => {
  const trimmed = query.trim();
  const providers = scopeProviders[scope];

  const { suggestions: postHits, isLoading: postsLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Posts,
      query: trimmed,
      enabled: providers.includes(SearchProviderEnum.Posts),
    });
  const { suggestions: tagHits, isLoading: tagsLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Tags,
      query: trimmed,
      enabled: providers.includes(SearchProviderEnum.Tags),
    });
  const { suggestions: sourceHits, isLoading: sourcesLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Sources,
      query: trimmed,
      enabled: providers.includes(SearchProviderEnum.Sources),
    });
  const { suggestions: userHits, isLoading: usersLoading } =
    useSearchProviderSuggestions({
      provider: SearchProviderEnum.Users,
      query: trimmed,
      enabled: providers.includes(SearchProviderEnum.Users),
    });

  return useMemo(() => {
    const posts = (postHits?.hits ?? []).map((hit) =>
      buildPostCommand(hit, router),
    );
    const tags = (tagHits?.hits ?? []).map((hit) =>
      buildTagCommand(hit, router),
    );
    const sources = (sourceHits?.hits ?? []).map((hit) =>
      buildSourceCommand(hit, router),
    );
    const users = (userHits?.hits ?? []).map((hit) =>
      buildUserCommand(hit, router),
    );

    const withSeeAll = (
      seeAllScope: SeeAllScope,
      items: SpotlightCommand[],
    ): SpotlightCommand[] =>
      items.length > 0 && trimmed
        ? [...items, buildSeeAllCommand(seeAllScope, trimmed, router)]
        : items;

    const isQueryLongEnough = trimmed.length >= minSearchQueryLength;
    const loadingFor = (
      provider: SearchProviderEnum,
      isProviderLoading: boolean,
    ) => isQueryLongEnough && providers.includes(provider) && isProviderLoading;

    const isPostsLoading = loadingFor(SearchProviderEnum.Posts, postsLoading);
    const isTagsLoading = loadingFor(SearchProviderEnum.Tags, tagsLoading);
    const isSourcesLoading = loadingFor(
      SearchProviderEnum.Sources,
      sourcesLoading,
    );
    const isUsersLoading = loadingFor(SearchProviderEnum.Users, usersLoading);

    return {
      isLoading:
        isPostsLoading || isTagsLoading || isSourcesLoading || isUsersLoading,
      posts: withSeeAll(SpotlightScope.Posts, posts),
      postsLoading: isPostsLoading,
      tags: withSeeAll(SpotlightScope.Tags, tags),
      tagsLoading: isTagsLoading,
      sources: withSeeAll(SpotlightScope.Squads, sources),
      sourcesLoading: isSourcesLoading,
      users: withSeeAll(SpotlightScope.People, users),
      usersLoading: isUsersLoading,
      fallthrough: buildFallthrough(trimmed, router),
    };
  }, [
    trimmed,
    router,
    providers,
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
