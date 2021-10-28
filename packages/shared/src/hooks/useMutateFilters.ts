import { QueryClient, useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import cloneDeep from 'lodash.clonedeep';
import { LoggedUser } from '../lib/user';
import { apiUrl } from '../lib/config';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../graphql/feedSettings';
import { Source } from '../graphql/sources';

export const getFeedSettingsQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'feedSettings',
];

export const getSearchTagsQueryKey = (query: string): string[] => [
  'searchTags',
  query,
];

type FollowTags = ({ tags: Array }) => Promise<unknown>;
// eslint-disable-next-line @typescript-eslint/no-shadow
type FollowSource = ({ source: Source }) => Promise<unknown>;

type ReturnType = {
  followTags: FollowTags;
  unfollowTags: FollowTags;
  blockTag: FollowTags;
  unblockTag: FollowTags;
  followSource: FollowSource;
  unfollowSource: FollowSource;
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
  const feedSettings = await queryClient.getQueryData<FeedSettingsData>(
    queryKey,
  );
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
  const feedSettings = await queryClient.getQueryData<FeedSettingsData>(
    queryKey,
  );
  const newData = manipulate(feedSettings.feedSettings, source);
  const keys = [queryKey, getFeedSettingsQueryKey(user)];
  await updateQueryData(queryClient, newData, keys);
  return async () => {
    await updateQueryData(queryClient, feedSettings.feedSettings, keys);
  };
};

export default function useMutateFilters(user?: LoggedUser): ReturnType {
  const queryClient = useQueryClient();

  const { mutateAsync: followTags } = useMutation<
    unknown,
    unknown,
    { tags: Array<string> },
    () => Promise<void>
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: ({ tags }) =>
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
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: blockTag } = useMutation<
    unknown,
    unknown,
    { tags: Array<string> },
    () => Promise<void>
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: ({ tags }) =>
        onMutateTagsSettings(
          tags,
          queryClient,
          (feedSettings, manipulateTags) => {
            const newData = cloneDeep(feedSettings);
            newData.blockedTags = newData.blockedTags.concat(manipulateTags);
            return newData;
          },
          user,
        ),
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: unfollowTags } = useMutation<
    unknown,
    unknown,
    { tags: Array<string> },
    () => void
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          includeTags: tags,
        },
      }),
    {
      onMutate: ({ tags }) =>
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
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: unblockTag } = useMutation<
    unknown,
    unknown,
    { tags: Array<string> },
    () => void
  >(
    ({ tags }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          blockedTags: tags,
        },
      }),
    {
      onMutate: ({ tags }) =>
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
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: followSource } = useMutation<
    unknown,
    unknown,
    { source: Source },
    () => void
  >(
    ({ source }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: ({ source }) =>
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
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: unfollowSource } = useMutation<
    unknown,
    unknown,
    { source: Source },
    () => Promise<void>
  >(
    ({ source }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          excludeSources: [source.id],
        },
      }),
    {
      onMutate: ({ source }) =>
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
      onError: (err, _, rollback) => rollback(),
    },
  );

  return {
    followTags,
    unfollowTags,
    blockTag,
    unblockTag,
    followSource,
    unfollowSource,
  };
}
