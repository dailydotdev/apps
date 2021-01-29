import { LoggedUser } from './user';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from './config';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../graphql/feedSettings';
import cloneDeep from 'lodash.clonedeep';

export const getFiltersQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'filters',
];

export const getTagsSettingsQueryKey = (user?: LoggedUser): string[] => [
  user?.id,
  'tagsSettings',
];

export const getSearchTagsQueryKey = (query: string): string[] => [
  'searchTags',
  query,
];

type ReturnType = {
  followTag: ({ tag: string }) => Promise<unknown>;
  unfollowTag: ({ tag: string }) => Promise<unknown>;
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

type ManipulateFunc = (feedSettings: FeedSettings, tag: string) => FeedSettings;

const onMutateSettings = async (
  tag: string,
  queryClient: QueryClient,
  manipulate: ManipulateFunc,
  user: LoggedUser,
): Promise<() => Promise<void>> => {
  const queryKey = getTagsSettingsQueryKey(user);
  const feedSettings = await queryClient.getQueryData<FeedSettingsData>(
    queryKey,
  );
  const newData = manipulate(feedSettings.feedSettings, tag);
  const keys = [queryKey, getFiltersQueryKey(user)];
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
        onMutateSettings(
          tag,
          queryClient,
          (feedSettings, tag) => {
            const newData = cloneDeep(feedSettings);
            newData.includeTags.push(tag);
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
        onMutateSettings(
          tag,
          queryClient,
          (feedSettings, tag) => {
            const newData = cloneDeep(feedSettings);
            const index = newData.includeTags.indexOf(tag);
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

  return { followTag, unfollowTag };
}
