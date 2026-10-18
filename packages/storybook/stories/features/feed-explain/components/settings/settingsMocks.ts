import { useMemo, useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { FeedType } from '@dailydotdev/shared/src/graphql/feed';
import type { Feed } from '@dailydotdev/shared/src/graphql/feed';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import type {
  FeedSettingsEditContextValue,
  FeedSettingsFormData,
} from '@dailydotdev/shared/src/components/feeds/FeedSettings/types';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { ADVANCED_SETTINGS } from '../../../../components/onboarding/signupFunnel.mocks';
import { useRouter } from '../../../../../mock/next-router';
import type { usePersonalization } from '../PersonalizationContext';

type Store = ReturnType<typeof usePersonalization>;

/**
 * The real feed settings sections read and write the API. While a settings
 * page is open these handlers answer from the personalization store and
 * write blocks back to it, so a block from the Filters page and one from a
 * card are the same block. Off the settings pages they pass the request on.
 */
const bridge: { store?: Store; words: string[] } = { words: [] };

export const bindSettingsStore = (store?: Store): void => {
  bridge.store = store;
};

const findSource = (pool: Post[], id: string) =>
  pool.find(({ source }) => source?.id === id)?.source;

const findAuthor = (pool: Post[], id: string) =>
  pool.find(({ author }) => author?.id === id)?.author;

const blockedNodes = (entity: ContentPreferenceType) => {
  const { store } = bridge;
  const base = { type: entity, status: ContentPreferenceStatus.Blocked };
  if (entity === ContentPreferenceType.Word) {
    return bridge.words.map((referenceId) => ({ ...base, referenceId }));
  }
  if (!store) {
    return [];
  }
  const { state, pool } = store;
  if (entity === ContentPreferenceType.Keyword) {
    return state.blockedTags.map((referenceId) => ({ ...base, referenceId }));
  }
  if (entity === ContentPreferenceType.Source) {
    return state.blockedSources.flatMap((id) => {
      const source = findSource(pool, id);
      return source ? [{ ...base, referenceId: id, source }] : [];
    });
  }
  return state.blockedAuthors.flatMap((id) => {
    const author = findAuthor(pool, id);
    return author
      ? [
          {
            ...base,
            referenceId: id,
            referenceUser: {
              ...author,
              contentPreference: { status: ContentPreferenceStatus.Blocked },
            },
          },
        ]
      : [];
  });
};

const setBlocked = (
  { id, entity }: { id: string; entity: ContentPreferenceType },
  isBlocked: boolean,
) => {
  if (entity === ContentPreferenceType.Word) {
    bridge.words = isBlocked
      ? [...new Set([...bridge.words, id])]
      : bridge.words.filter((word) => word !== id);
    return;
  }
  const { store } = bridge;
  if (!store) {
    return;
  }
  if (entity === ContentPreferenceType.Keyword) {
    store.setTagBlocked(id, isBlocked);
    return;
  }
  if (entity === ContentPreferenceType.Source) {
    const source = findSource(store.pool, id);
    store.setSourceBlocked({ id, name: source?.name ?? id }, isBlocked);
    return;
  }
  const author = findAuthor(store.pool, id);
  store.setAuthorBlocked({ id, name: author?.name ?? id }, isBlocked);
};

export const settingsHandlers = [
  graphql.query('UserBlocked', ({ variables }) =>
    HttpResponse.json({
      data: {
        userBlocked: {
          pageInfo: { endCursor: null, hasNextPage: false },
          edges: blockedNodes(variables.entity).map((node) => ({ node })),
        },
      },
    }),
  ),
  graphql.query('FeedPreferences', () => {
    const state = bridge.store?.state;
    // Off the settings pages, the full explanation seeds this query itself.
    if (!state) {
      return undefined;
    }
    return HttpResponse.json({
      data: {
        tagsCategories: [],
        advancedSettings: ADVANCED_SETTINGS,
        feedSettings: {
          includeTags: state.followedTags,
          blockedTags: state.blockedTags,
          includeSources: [],
          excludeSources: [],
          advancedSettings: [],
        },
      },
    });
  }),
  graphql.mutation('UpdateFeedAdvancedSettings', ({ variables }) =>
    HttpResponse.json({ data: { feedSettings: variables.settings } }),
  ),
  ...(['Block', 'Unblock'] as const).map((name) =>
    graphql.mutation(name, ({ variables }) => {
      if (!bridge.store) {
        return undefined;
      }
      setBlocked(
        variables as { id: string; entity: ContentPreferenceType },
        name === 'Block',
      );
      return HttpResponse.json({ data: { [name.toLowerCase()]: { _: true } } });
    }),
  ),
];

/** What `FeedSettingsLayout` provides for the main feed, without the API. */
export const useMainFeedEditContext = (
  user?: LoggedUser,
): FeedSettingsEditContextValue => {
  const [data, setData] = useState<FeedSettingsFormData>({ name: '' });

  return useMemo(() => {
    const id = user?.id ?? '';
    const feed: Feed = {
      id,
      userId: id,
      slug: id,
      flags: { name: '' },
      type: FeedType.Main,
      createdAt: new Date(),
    };
    return {
      feed,
      data,
      setData: (next) => setData((current) => ({ ...current, ...next })),
      onSubmit: async () => feed,
      isSubmitPending: false,
      onDelete: async () => ({ id }),
      deleteStatus: 'idle',
      onTagClick: () => undefined,
      onDiscard: async () => true,
      isDirty: false,
      onBackToFeed: () => undefined,
      editFeedSettings: (callback) => callback?.(),
      // Keeps segment tabs in state: the Storybook router has no address to
      // write `?tab=` to.
      isNewFeed: true,
    };
  }, [user?.id, data]);
};

/** A settings address, so the phone's search field rests where the bar would. */
export const mockSettingsRoute = (): void => {
  useRouter.mockImplementation(() => ({
    replace: fn(),
    push: fn(),
    pathname: '/settings/feed',
    asPath: '/settings/feed',
    query: {},
    events: { on: fn(), off: fn() },
  }));
};
