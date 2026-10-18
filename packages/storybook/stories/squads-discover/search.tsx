import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect } from 'react';
import { graphql, HttpResponse } from 'msw';
import {
  SpotlightProvider,
  useSpotlight,
} from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { Spotlight } from '@dailydotdev/shared/src/components/spotlight/Spotlight';
import { SpotlightScope } from '@dailydotdev/shared/src/components/spotlight/types';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import ExtensionProviders from '../extension/_providers';
import { DiscoverStyles, JoinProvider, JoinToastHost } from './kit';
import { SquadSearchContext } from './parts';
import { CategoryHub } from './layouts/CategoryHub';
import { rawSquads } from './raw';
import {
  samplePosts,
  sampleTags,
  sampleUsers,
  spotlightActions,
} from './spotlightData';

// The squads page's search is production's Spotlight, opened already
// scoped to Squads: the same palette, the same "Squads" pill people know
// from ⌘K, no second search UI to build. Rendered on the canvas rather
// than in a device frame because the palette portals into the document.

const words = (value: unknown): string[] =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

/** Sample hits whose title or subtitle holds every typed word. */
const matching = <T extends { title: string; subtitle?: string | null }>(
  hits: T[],
  query: unknown,
): T[] => {
  const needles = words(query);
  return hits.filter((hit) => {
    const text = `${hit.title} ${hit.subtitle ?? ''}`.toLowerCase();
    return needles.every((needle) => text.includes(needle));
  });
};

/**
 * Spotlight's queries answered from fixtures: part of production's action
 * catalog, squads from the directory fixture (name or handle, biggest
 * first), and a hand-written sample of posts, people and tags.
 */
export const squadSearchHandlers = [
  graphql.query('SpotlightActions', () =>
    HttpResponse.json({ data: { spotlightActions } }),
  ),
  graphql.query('SearchSourceSuggestions', ({ variables }) => {
    const needle = words(variables.query).join(' ');
    const hits = rawSquads
      .filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.handle.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.membersCount - a.membersCount)
      .slice(0, Number(variables.limit) || 3)
      .map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.handle,
        image: item.image,
        sourceType: SourceType.Squad,
        verified: item.verified,
        contentPreference: null,
      }));
    return HttpResponse.json({ data: { searchSourceSuggestions: { hits } } });
  }),
  graphql.query('SearchPostSuggestions', ({ variables }) =>
    HttpResponse.json({
      data: {
        searchPostSuggestions: {
          hits: matching(samplePosts, variables.query).slice(0, 10),
        },
      },
    }),
  ),
  graphql.query('SearchUserSuggestions', ({ variables }) =>
    HttpResponse.json({
      data: {
        searchUserSuggestions: {
          hits: matching(sampleUsers, variables.query)
            .slice(0, Number(variables.limit) || 3)
            .map((hit) => ({ ...hit, contentPreference: null })),
        },
      },
    }),
  ),
  graphql.query('SearchTagSuggestions', ({ variables }) =>
    HttpResponse.json({
      data: {
        searchTagSuggestions: {
          hits: matching(sampleTags, variables.query).slice(
            0,
            Number(variables.limit) || 3,
          ),
        },
      },
    }),
  ),
];

/**
 * A search for "ai" that lands on every kind of squad: verified only
 * (AgentField.ai), promoted only (builder.io), verified and promoted
 * (Ahurasense) and regular ones. With `labelPromoted` the campaigns' handle
 * line opens with "Promoted", the proposal for search.
 */
export const verifiedPromotedSearchHandlers = (labelPromoted: boolean) => [
  graphql.query('SearchSourceSuggestions', () => {
    const picks: { handle: string; promoted?: boolean }[] = [
      { handle: 'agentfield' },
      { handle: 'builderio', promoted: true },
      { handle: 'ahurasense', promoted: true },
      { handle: 'ai' },
      { handle: 'buildwithgenai' },
    ];
    const hits = picks.map(({ handle, promoted }) => {
      const item = rawSquads.find((raw) => raw.handle === handle);
      if (!item) {
        throw new Error(`Unknown squad ${handle}`);
      }
      return {
        id: item.id,
        title: item.name,
        subtitle:
          labelPromoted && promoted ? `Promoted · ${item.handle}` : item.handle,
        image: item.image,
        sourceType: SourceType.Squad,
        verified: item.verified,
        contentPreference: null,
      };
    });
    return HttpResponse.json({ data: { searchSourceSuggestions: { hits } } });
  }),
  ...squadSearchHandlers,
];

const ScopedSearch = ({
  children,
  query,
}: {
  children: ReactNode;
  query?: string;
}): ReactElement => {
  const { isOpen, close, openWithScope, setQuery } = useSpotlight();
  const openSquadSearch = useCallback(
    () => openWithScope(SpotlightScope.Squads),
    [openWithScope],
  );

  useEffect(() => {
    openSquadSearch();
    if (query) {
      setQuery(query);
    }
    // Opens once, the way a click on the page's search field would.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SquadSearchContext.Provider value={openSquadSearch}>
      {children}
      <Spotlight isOpen={isOpen} onClose={close} />
    </SquadSearchContext.Provider>
  );
};

export const SquadSearchDemo = ({
  query,
}: {
  query?: string;
}): ReactElement => (
  <ExtensionProviders>
    <DiscoverStyles />
    <JoinProvider>
      <SpotlightProvider>
        <ScopedSearch query={query}>
          <CategoryHub />
        </ScopedSearch>
      </SpotlightProvider>
      <JoinToastHost />
    </JoinProvider>
  </ExtensionProviders>
);
