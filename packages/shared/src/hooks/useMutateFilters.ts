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

export const getTagsFiltersQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'tagsFilters',
];

export const getTagsSettingsQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'tagsSettings',
];

export const getSearchTagsQueryKey = (query: string): string[] => [
  'searchTags',
  query,
];

export const getSourcesFiltersQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'sourcesFilters',
];

export const getSourcesSettingsQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'sourcesSettings',
];

type FollowTag = ({ tag: string }) => Promise<unknown>;
// eslint-disable-next-line @typescript-eslint/no-shadow
type FollowSource = ({ source: Source }) => Promise<unknown>;

type ReturnType = {
  followTag: FollowTag;
  unfollowTag: FollowTag;
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
  tag: string,
) => FeedSettings;

const onMutateTagsSettings = async (
  tag: string,
  queryClient: QueryClient,
  manipulate: ManipulateTagFunc,
  user: LoggedUser,
): Promise<() => Promise<void>> => {
  const queryKey = getTagsSettingsQueryKey(user);
  const feedSettings = await queryClient.getQueryData<FeedSettingsData>(
    queryKey,
  );
  const newData = manipulate(feedSettings.feedSettings, tag);
  const keys = [queryKey, getTagsFiltersQueryKey(user)];
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
  const queryKey = getSourcesSettingsQueryKey(user);
  const feedSettings = await queryClient.getQueryData<FeedSettingsData>(
    queryKey,
  );
  const newData = manipulate(feedSettings.feedSettings, source);
  const keys = [queryKey, getSourcesFiltersQueryKey(user)];
  await updateQueryData(queryClient, newData, keys);
  return async () => {
    await updateQueryData(queryClient, feedSettings.feedSettings, keys);
  };
};

export default function useMutateFilters(user?: LoggedUser): ReturnType {
  const queryClient = useQueryClient();

  const { mutateAsync: followTag } = useMutation<
    unknown,
    unknown,
    { tag: string },
    () => Promise<void>
  >(
    ({ tag }) =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeTags: [tag],
        },
      }),
    {
      onMutate: ({ tag }) =>
        onMutateTagsSettings(
          tag,
          queryClient,
          (feedSettings, manipulateTag) => {
            const newData = cloneDeep(feedSettings);
            newData.includeTags.push(manipulateTag);
            return newData;
          },
          user,
        ),
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: unfollowTag } = useMutation<
    unknown,
    unknown,
    { tag: string },
    () => void
  >(
    ({ tag }) =>
      request(`${apiUrl}/graphql`, REMOVE_FILTERS_FROM_FEED_MUTATION, {
        filters: {
          includeTags: [tag],
        },
      }),
    {
      onMutate: ({ tag }) =>
        onMutateTagsSettings(
          tag,
          queryClient,
          (feedSettings, manipulateTag) => {
            const newData = cloneDeep(feedSettings);
            const index = newData.includeTags.indexOf(manipulateTag);
            if (index > -1) {
              newData.includeTags.splice(index, 1);
            }
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

  return { followTag, unfollowTag, followSource, unfollowSource };
}
