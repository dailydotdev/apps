import { useCallback, useMemo } from 'react';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import request from 'graphql-request';
import cloneDeep from 'lodash.clonedeep';
import { LoggedUser } from '../lib/user';
import { graphqlUrl } from '../lib/config';
import {
  FeedAdvancedSettings,
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
  FEED_FILTERS_FROM_REGISTRATION,
} from '../graphql/feedSettings';
import { Source } from '../graphql/sources';
import { getFeedSettingsQueryKey } from './useFeedSettings';
import { RequestKey, generateQueryKey } from '../lib/query';

export const getSearchTagsQueryKey = (query: string): string[] => [
  'searchTags',
  query,
];

interface TagsMutationProps {
  tags: string[];
}

interface SourceMutationProps {
  source: Source;
}

interface AdvancedSettingsMutationProps {
  advancedSettings: FeedAdvancedSettings[];
}

type FollowTagsFunc = (params: TagsMutationProps) => unknown;
type FollowTagsPromise = (params: TagsMutationProps) => Promise<unknown>;
type FollowTags = FollowTagsFunc | FollowTagsPromise;
type FollowSource = (params: SourceMutationProps) => Promise<unknown>;

type UpdateAdvancedSettings = (
  params: AdvancedSettingsMutationProps,
) => Promise<unknown>;

type ReturnType = {
  followTags: FollowTags;
  unfollowTags: FollowTags;
  blockTag: FollowTags;
  unblockTag: FollowTags;
  followSource: FollowSource;
  unfollowSource: FollowSource;
  updateAdvancedSettings: UpdateAdvancedSettings;
  updateFeedFilters: (feedSettings: FeedSettings) => Promise<unknown>;
};

async function updateQueryData(
  queryClient: QueryClient,
  newSettings: FeedSettings,
  keys: string[][],
): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      await queryClient.cancelQueries(key);
      queryClient.setQueryData<FeedSettingsData>(key, (cachedData) => {
        if (!cachedData) {
          return cachedData;
        }
        const newData = cloneDeep(cachedData);
        newData.feedSettings = newSettings;
        return newData;
      });
    }),
  );
}

type ManipulateAdvancedSettingsFunc = (
  feedSettings: FeedSettings,
  advancedSettings: FeedAdvancedSettings[],
) => FeedSettings;

const onMutateAdvancedSettings = async (
  advancedSettings: FeedAdvancedSettings[],
  queryClient: QueryClient,
  manipulate: ManipulateAdvancedSettingsFunc,
  user: LoggedUser,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, advancedSettings);
  const keys = [queryKey, queryKey];
  await updateQueryData(queryClient, newData, keys);
  return async () => {
    await updateQueryData(queryClient, feedSettings.feedSettings, keys);
  };
};

type ManipulateTagFunc = (
  feedSettings: FeedSettings,
  tags: Array<string>,
) => FeedSettings;

const onMutateTagsSettings = async (
  tags: Array<string>,
  queryClient: QueryClient,
  manipulate: ManipulateTagFunc,
  user: LoggedUser,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, tags);
  const keys = [queryKey, getFeedSettingsQueryKey(user)];
  await updateQueryData(queryClient, newData, keys);
  return async () => {
    await updateQueryData(queryClient, feedSettings.feedSettings, keys);
  };
};

type ManipulateSourceFunc = (
  feedSettings: FeedSettings,
  source: Source,
) => FeedSettings;

const onMutateSourcesSettings = async (
  source: Source,
  queryClient: QueryClient,
  manipulate: ManipulateSourceFunc,
  user: LoggedUser,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, source);
  const keys = [queryKey, getFeedSettingsQueryKey(user)];
  await updateQueryData(queryClient, newData, keys);
  return async () => {
    await updateQueryData(queryClient, feedSettings.feedSettings, keys);
  };
};

const clearNotificationPreference = async ({
  queryClient,
  user,
}: {
  queryClient: QueryClient;
  user: LoggedUser;
}) => {
  return queryClient.invalidateQueries({
    queryKey: generateQueryKey(RequestKey.NotificationPreference, user),
  });
};

export default function useMutateFilters(user?: LoggedUser): ReturnType {
  const queryClient = useQueryClient();
  const shouldFilterLocally = !user;

  const updateFeedFilters = useCallback(
    ({ advancedSettings, ...filters }: FeedSettings) => {
      const {
        blockedTags = [],
        excludeSources = [],
        includeTags = [],
      } = filters ?? {};
      const fixed: typeof filters = {
        includeTags: Array.from(new Set(includeTags)),
        blockedTags: Array.from(new Set(blockedTags)),
        excludeSources: Array.from(new Set(excludeSources)),
      };
      return request(graphqlUrl, FEED_FILTERS_FROM_REGISTRATION, {
        filters: fixed,
        settings: advancedSettings,
      });
    },
    [],
  );

  const onAdvancedSettingsUpdate = useCallback(
    ({ advancedSettings }: AdvancedSettingsMutationProps) =>
      onMutateAdvancedSettings(
        advancedSettings,
        queryClient,
        (feedSettings, [feedAdvancedSettings]) => {
          const newData = cloneDeep(feedSettings);
          const index = newData.advancedSettings.findIndex(
            (settings) => settings.id === feedAdvancedSettings.id,
          );
          if (index === -1) {
            newData.advancedSettings.push(feedAdvancedSettings);
          } else {
            newData.advancedSettings[index] = feedAdvancedSettings;
          }
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: updateAdvancedSettingsRemote } = useMutation<
    unknown,
    unknown,
    AdvancedSettingsMutationProps,
    () => Promise<void>
  >(
    ({ advancedSettings: settings }) =>
      request(graphqlUrl, UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION, {
        settings,
      }),
    {
      onMutate: onAdvancedSettingsUpdate,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onFollowTags = useCallback(
    ({ tags }: TagsMutationProps) =>
      onMutateTagsSettings(
        tags,
        queryClient,
        (feedSettings, manipulateTags) => {
          const newData = cloneDeep(feedSettings);
          newData.includeTags = newData.includeTags.concat(manipulateTags);
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: followTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      request(graphqlUrl, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: onFollowTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onBlockTags = useCallback(
    ({ tags }: TagsMutationProps) =>
      onMutateTagsSettings(
        tags,
        queryClient,
        (feedSettings, manipulateTags) => {
          const newData = cloneDeep(feedSettings);
          newData.blockedTags = [
            ...Array.from(new Set(newData.blockedTags.concat(manipulateTags))),
          ];

          newData.includeTags = newData.includeTags.filter(
            (value) => manipulateTags.indexOf(value) < 0,
          );
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: blockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      request(graphqlUrl, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: onBlockTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnfollowTags = useCallback(
    ({ tags }: TagsMutationProps) =>
      onMutateTagsSettings(
        tags,
        queryClient,
        (feedSettings, manipulateTags) => {
          const newData = cloneDeep(feedSettings);
          newData.includeTags = newData.includeTags.filter(
            (value) => manipulateTags.indexOf(value) < 0,
          );
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: unfollowTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      request(graphqlUrl, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: onUnfollowTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnblockTags = useCallback(
    ({ tags }: TagsMutationProps) =>
      onMutateTagsSettings(
        tags,
        queryClient,
        (feedSettings, manipulateTags) => {
          const newData = cloneDeep(feedSettings);
          newData.blockedTags = newData.blockedTags.filter(
            (value) => manipulateTags.indexOf(value) < 0,
          );
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: unblockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      request(graphqlUrl, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: onUnblockTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onFollowSource = useCallback(
    ({ source }: SourceMutationProps) =>
      onMutateSourcesSettings(
        source,
        queryClient,
        (feedSettings, manipulateSource) => {
          const newData = cloneDeep(feedSettings);
          const index = newData.excludeSources.findIndex(
            (s) => s.id === manipulateSource.id,
          );
          if (index > -1) {
            newData.excludeSources.splice(index, 1);
          }
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: followSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => void
  >(
    ({ source }) =>
      request(graphqlUrl, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: onFollowSource,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnfollowSource = useCallback(
    ({ source }: SourceMutationProps) =>
      onMutateSourcesSettings(
        source,
        queryClient,
        (feedSettings, manipulateSource) => {
          const newData = cloneDeep(feedSettings);
          newData.excludeSources.push(manipulateSource);
          return newData;
        },
        user,
      ),
    [user, queryClient],
  );

  const { mutateAsync: unfollowSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >(
    ({ source }) =>
      request(graphqlUrl, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: onUnfollowSource,
      onError: (err, _, rollback) => rollback(),
      onSuccess: () => {
        // when unfollowing source notification preference is cleared
        // on the api side so we invalidate the cache
        clearNotificationPreference({ queryClient, user });
      },
    },
  );

  return useMemo(
    () => ({
      updateFeedFilters,
      followTags: shouldFilterLocally ? onFollowTags : followTagsRemote,
      unfollowTags: shouldFilterLocally ? onUnfollowTags : unfollowTagsRemote,
      blockTag: shouldFilterLocally ? onBlockTags : blockTagRemote,
      unblockTag: shouldFilterLocally ? onUnblockTags : unblockTagRemote,
      followSource: shouldFilterLocally ? onFollowSource : followSourceRemote,
      unfollowSource: shouldFilterLocally
        ? onUnfollowSource
        : unfollowSourceRemote,
      updateAdvancedSettings: shouldFilterLocally
        ? onAdvancedSettingsUpdate
        : updateAdvancedSettingsRemote,
    }),
    [
      shouldFilterLocally,
      updateFeedFilters,
      onFollowTags,
      onUnfollowTags,
      onBlockTags,
      onUnblockTags,
      onFollowSource,
      onUnfollowSource,
      onAdvancedSettingsUpdate,
      followTagsRemote,
      unfollowTagsRemote,
      blockTagRemote,
      unblockTagRemote,
      followSourceRemote,
      unfollowSourceRemote,
      updateAdvancedSettingsRemote,
    ],
  );
}
