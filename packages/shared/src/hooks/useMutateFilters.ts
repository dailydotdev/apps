import { useContext } from 'react';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import cloneDeep from 'lodash.clonedeep';
import { LoggedUser } from '../lib/user';
import { apiUrl } from '../lib/config';
import {
  FeedAdvancedSettings,
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
} from '../graphql/feedSettings';
import { Source } from '../graphql/sources';
import {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from './useFeedSettings';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';

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
// eslint-disable-next-line @typescript-eslint/no-shadow
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
};

async function updateQueryData(
  queryClient: QueryClient,
  newSettings: FeedSettings,
  keys: string[][],
  storeFiltersLocally: boolean,
): Promise<void> {
  if (storeFiltersLocally) {
    updateLocalFeedSettings(newSettings);
  }
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
  storeFiltersLocally: boolean,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, advancedSettings);
  const keys = [queryKey, queryKey];
  await updateQueryData(queryClient, newData, keys, storeFiltersLocally);
  return async () => {
    await updateQueryData(
      queryClient,
      feedSettings.feedSettings,
      keys,
      storeFiltersLocally,
    );
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
  storeFiltersLocally: boolean,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, tags);
  const keys = [queryKey, getFeedSettingsQueryKey(user)];
  await updateQueryData(queryClient, newData, keys, storeFiltersLocally);
  return async () => {
    await updateQueryData(
      queryClient,
      feedSettings.feedSettings,
      keys,
      storeFiltersLocally,
    );
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
  storeFiltersLocally: boolean,
): Promise<() => Promise<void>> => {
  const queryKey = getFeedSettingsQueryKey(user);
  const feedSettings = queryClient.getQueryData<FeedSettingsData>(queryKey);
  const newData = manipulate(feedSettings.feedSettings, source);
  const keys = [queryKey, getFeedSettingsQueryKey(user)];
  await updateQueryData(queryClient, newData, keys, storeFiltersLocally);
  return async () => {
    await updateQueryData(
      queryClient,
      feedSettings.feedSettings,
      keys,
      storeFiltersLocally,
    );
  };
};

export default function useMutateFilters(user?: LoggedUser): ReturnType {
  const queryClient = useQueryClient();
  const { flags } = useContext(FeaturesContext);
  const shouldShowMyFeed = getFeatureValue(Features.MyFeedOn, flags, 'false');
  const shouldStoreFiltersLocally = shouldShowMyFeed && !user;

  const onAdvancedSettingsUpdate = ({
    advancedSettings,
  }: AdvancedSettingsMutationProps) =>
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
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: updateAdvancedSettingsRemote } = useMutation<
    unknown,
    unknown,
    AdvancedSettingsMutationProps,
    () => Promise<void>
  >(
    ({ advancedSettings: settings }) =>
      request(`${apiUrl}/graphql`, UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION, {
        settings,
      }),
    {
      onMutate: onAdvancedSettingsUpdate,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onFollowTags = ({ tags }: TagsMutationProps) =>
    onMutateTagsSettings(
      tags,
      queryClient,
      (feedSettings, manipulateTags) => {
        const newData = cloneDeep(feedSettings);
        newData.includeTags = newData.includeTags.concat(manipulateTags);
        return newData;
      },
      user,
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: followTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: onFollowTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onBlockTags = ({ tags }: TagsMutationProps) =>
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
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: blockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => Promise<void>
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: onBlockTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnfollowTags = ({ tags }: TagsMutationProps) =>
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
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: unfollowTagsRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: onUnfollowTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnblockTags = ({ tags }: TagsMutationProps) =>
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
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: unblockTagRemote } = useMutation<
    unknown,
    unknown,
    TagsMutationProps,
    () => void
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: onUnblockTags,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onFollowSource = ({ source }: SourceMutationProps) =>
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
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: followSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => void
  >(
    ({ source }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: onFollowSource,
      onError: (err, _, rollback) => rollback(),
    },
  );

  const onUnfollowSource = ({ source }: SourceMutationProps) =>
    onMutateSourcesSettings(
      source,
      queryClient,
      (feedSettings, manipulateSource) => {
        const newData = cloneDeep(feedSettings);
        newData.excludeSources.push(manipulateSource);
        return newData;
      },
      user,
      shouldStoreFiltersLocally,
    );

  const { mutateAsync: unfollowSourceRemote } = useMutation<
    unknown,
    unknown,
    SourceMutationProps,
    () => Promise<void>
  >(
    ({ source }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: onUnfollowSource,
      onError: (err, _, rollback) => rollback(),
    },
  );

  return {
    followTags: user ? followTagsRemote : onFollowTags,
    unfollowTags: user ? unfollowTagsRemote : onUnfollowTags,
    blockTag: user ? blockTagRemote : onBlockTags,
    unblockTag: user ? unblockTagRemote : onUnblockTags,
    followSource: user ? followSourceRemote : onFollowSource,
    unfollowSource: user ? unfollowSourceRemote : onUnfollowSource,
    updateAdvancedSettings: user
      ? updateAdvancedSettingsRemote
      : onAdvancedSettingsUpdate,
  };
}
