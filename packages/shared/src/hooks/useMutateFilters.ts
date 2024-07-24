import { useCallback, useMemo } from 'react';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import cloneDeep from 'lodash.clonedeep';
import { LoggedUser } from '../lib/user';
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
import { gqlClient } from '../graphql/common';

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
  unfollowSource: FollowSource;
  followSource: FollowSource;
  unblockSource: FollowSource;
  blockSource: FollowSource;
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
  feedId: string | undefined,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user, feedId);
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
  feedId: string | undefined,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user, feedId);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, tags);
  const keys = [queryKey, getFeedSettingsQueryKey(user, feedId)];
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
  feedId: string | undefined,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user, feedId);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, source);
  const keys = [queryKey, getFeedSettingsQueryKey(user, feedId)];
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

export default function useMutateFilters(
  user?: LoggedUser,
  feedId?: string,
  shouldFilterLocallyProp = false,
): ReturnType {
  const queryClient = useQueryClient();
  const shouldFilterLocally = shouldFilterLocallyProp || !user;

  const updateFeedFilters = useCallback(
    ({ advancedSettings, ...filters }: FeedSettings) => {
      const {
        blockedTags = [],
        excludeSources = [],
        includeSources = [],
        includeTags = [],
      } = filters ?? {};
      const fixed: typeof filters = {
        includeTags: Array.from(new Set(includeTags)),
        blockedTags: Array.from(new Set(blockedTags)),
        excludeSources: Array.from(new Set(excludeSources)),
        includeSources: Array.from(new Set(includeSources)),
      };
      return gqlClient.request(FEED_FILTERS_FROM_REGISTRATION, {
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: updateAdvancedSettingsRemote } = useMutation<
    unknown,
    unknown,
    AdvancedSettingsMutationProps,
    () => Promise<void>
  >(
    ({ advancedSettings: settings }) =>
      gqlClient.request(UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION, {
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: followTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: blockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: unfollowTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: unblockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: onUnblockTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnblockSource = useCallback(
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: unblockSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >({
    mutationFn: ({ source }) =>
      gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    onMutate: onUnblockSource,
    onError: (err, _, rollback) => rollback(),
  });

  const onFollowSource = useCallback(
    ({ source }: SourceMutationProps) =>
      onMutateSourcesSettings(
        source,
        queryClient,
        (feedSettings, manipulateSource) => {
          const newData = cloneDeep(feedSettings);
          newData.includeSources.push(manipulateSource);
          return newData;
        },
        user,
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: followSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >({
    mutationFn: ({ source }) =>
      gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeSources: [source.id],
        },
      }),
    onMutate: onFollowSource,
    onError: (err, _, rollback) => rollback(),
  });

  const onUnfollowSource = useCallback(
    ({ source }: SourceMutationProps) =>
      onMutateSourcesSettings(
        source,
        queryClient,
        (feedSettings, manipulateSource) => {
          const newData = cloneDeep(feedSettings);
          newData.includeSources = newData.includeSources.filter(
            (s) => s.id !== manipulateSource?.id,
          );
          return newData;
        },
        user,
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: unfollowSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >({
    mutationFn: ({ source }) =>
      gqlClient.request(REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          includeSources: [source.id],
        },
      }),
    onMutate: onUnfollowSource,
    onError: (err, _, rollback) => rollback(),
  });

  const onBlockSource = useCallback(
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
        feedId,
      ),
    [user, queryClient, feedId],
  );

  const { mutateAsync: blockSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >({
    mutationFn: ({ source }) =>
      gqlClient.request(ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    onMutate: onBlockSource,
    onSuccess: () => clearNotificationPreference({ queryClient, user }),
    onError: (err, _, rollback) => rollback(),
  });

  return useMemo(
    () => ({
      updateFeedFilters,
      followTags: shouldFilterLocally ? onFollowTags : followTagsRemote,
      unfollowTags: shouldFilterLocally ? onUnfollowTags : unfollowTagsRemote,
      blockTag: shouldFilterLocally ? onBlockTags : blockTagRemote,
      followSource: shouldFilterLocally ? onFollowSource : followSourceRemote,
      unfollowSource: shouldFilterLocally
        ? onUnfollowSource
        : unfollowSourceRemote,
      unblockTag: shouldFilterLocally ? onUnblockTags : unblockTagRemote,
      unblockSource: shouldFilterLocally
        ? onUnblockSource
        : unblockSourceRemote,
      blockSource: shouldFilterLocally ? onBlockSource : blockSourceRemote,
      updateAdvancedSettings: shouldFilterLocally
        ? onAdvancedSettingsUpdate
        : updateAdvancedSettingsRemote,
    }),
    [
      blockSourceRemote,
      blockTagRemote,
      followSourceRemote,
      followTagsRemote,
      onAdvancedSettingsUpdate,
      onBlockSource,
      onBlockTags,
      onFollowSource,
      onFollowTags,
      onUnblockSource,
      onUnblockTags,
      onUnfollowSource,
      onUnfollowTags,
      shouldFilterLocally,
      unblockSourceRemote,
      unblockTagRemote,
      unfollowSourceRemote,
      unfollowTagsRemote,
      updateAdvancedSettingsRemote,
      updateFeedFilters,
    ],
  );
}
