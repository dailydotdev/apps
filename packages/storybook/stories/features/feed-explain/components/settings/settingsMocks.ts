import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
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
import type { AdvancedSettings } from '@dailydotdev/shared/src/graphql/feedSettings';
import { AdvancedSettingsGroup } from '@dailydotdev/shared/src/graphql/feedSettings';
import { ADVANCED_SETTINGS } from '../../../../components/onboarding/signupFunnel.mocks';
import { useRouter } from '../../../../../mock/next-router';
import { curations } from '../../policy/curation';
import { usePersonalization } from '../PersonalizationContext';

type Store = ReturnType<typeof usePersonalization>;

/**
 * The real feed settings sections read and write the API. While a settings
 * page is open these handlers answer from the personalization store and
 * write blocks back to it, so a block from the Filters page and one from a
 * card are the same block. Off the settings pages they pass the request on.
 */
const bridge: {
  store?: Store;
  words: string[];
  /** Advanced settings the viewer turned on or off, by id. */
  advanced: Record<number, boolean>;
} = { words: [], advanced: {} };

// The API's description for each post category, as daily-api seeds them.
const curationDescriptions: Record<string, string> = {
  news: 'Immediate reports and updates on important events and breakthroughs.',
  opinion: 'Posts expressing personal views, interpretations, or predictions.',
  listicle:
    'Posts formatted as lists that curate multiple items around a topic.',
  comparison: 'Posts discussing similarities and differences between entities.',
  story:
    'Evergreen posts providing context and perspective on events or topics.',
  tutorial: 'Step-by-step guides focused on a specific skill or topic.',
  release: 'Announcements or coverage of new versions or product features.',
  meme: 'Humorous posts reflecting cultural trends and ideas.',
  drama: 'Posts centered on conflicts or controversy within the industry.',
  endorsement: 'Posts recommending or praising a product, tool, or approach.',
  criticism: 'Posts highlighting issues, concerns, or shortcomings.',
  leak: 'Posts about leaked information or unannounced details.',
  milestone: 'Posts marking significant achievements or milestones.',
  hot_take: 'Posts with provocative or strongly opinionated perspectives.',
};

/**
 * The advanced settings list, with the post categories as daily-api seeds
 * them (seeds/AdvancedSettings.json). The captured production list has only
 * the first 8, so the categories take ids past it.
 */
export const advancedSettings: AdvancedSettings[] = [
  ...ADVANCED_SETTINGS.filter(
    ({ group }) => group !== AdvancedSettingsGroup.ContentCuration,
  ),
  ...curations.map(({ id, title }, index) => ({
    id: 101 + index,
    title,
    description: curationDescriptions[id] ?? '',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
    options: { type: id },
  })),
];

const getCurationId = (settingId: number): string | undefined =>
  advancedSettings.find(
    ({ id, group }) =>
      id === settingId && group === AdvancedSettingsGroup.ContentCuration,
  )?.options?.type;

const bindSettingsStore = (store?: Store): void => {
  bridge.store = store;
};

/**
 * Binds the API mocks to the store while a settings page or Tune is open,
 * and refetches what a change from anywhere (a card, Undo) made stale.
 */
export const useSettingsStoreBridge = (): void => {
  const store = usePersonalization();
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { blockedTags, blockedSources, blockedAuthors, blockedCurations } =
    store.state;

  useEffect(() => {
    bindSettingsStore(store);
  }, [store]);
  useEffect(() => () => bindSettingsStore(undefined), []);
  useEffect(() => {
    client.invalidateQueries({
      queryKey: generateQueryKey(
        RequestKey.ContentPreference,
        user,
        RequestKey.UserBlocked,
      ),
    });
  }, [client, user, blockedTags, blockedSources, blockedAuthors]);
  useEffect(() => {
    // Feed settings never refetch on mount, so refetch the inactive ones too.
    client.invalidateQueries({
      queryKey: [user?.id, RequestKey.FeedSettings],
      refetchType: 'all',
    });
  }, [client, user, blockedCurations]);
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
        advancedSettings,
        feedSettings: {
          includeTags: state.followedTags,
          blockedTags: state.blockedTags,
          includeSources: [],
          excludeSources: [],
          // Categories follow the store's hidden list, which cards and
          // the complaint box change too.
          advancedSettings: [
            ...Object.entries(bridge.advanced).map(([id, enabled]) => ({
              id: Number(id),
              enabled,
            })),
            ...advancedSettings.flatMap(({ id }) => {
              const curation = getCurationId(id);
              return curation
                ? [
                    {
                      id,
                      enabled: !state.blockedCurations?.includes(curation),
                    },
                  ]
                : [];
            }),
          ],
        },
      },
    });
  }),
  graphql.mutation('UpdateFeedAdvancedSettings', ({ variables }) => {
    const settings = variables.settings as Array<{
      id: number;
      enabled: boolean;
    }>;
    settings.forEach(({ id, enabled }) => {
      const curation = getCurationId(id);
      if (curation && bridge.store) {
        bridge.store.setCurationHidden(curation, !enabled);
        return;
      }
      bridge.advanced[id] = enabled;
    });
    return HttpResponse.json({ data: { feedSettings: settings } });
  }),
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
