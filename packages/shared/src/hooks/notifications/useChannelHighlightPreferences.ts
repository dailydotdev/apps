import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  CHANNEL_HIGHLIGHT_PREFERENCES_QUERY_KEY,
  SET_CHANNEL_HIGHLIGHT_PREFERENCE_MUTATION,
  channelHighlightPreferencesQueryOptions,
} from '../../graphql/highlights';
import type {
  ChannelConfiguration,
  ChannelConfigurationsData,
  HighlightSignificance,
} from '../../graphql/highlights';
import { useAuthContext } from '../../contexts/AuthContext';

type UseChannelHighlightPreferencesResult = {
  channels: ChannelConfiguration[];
  isLoading: boolean;
  isPending: boolean;
  getMinSignificance: (
    channel: string,
  ) => HighlightSignificance | null | undefined;
  isChannelSubscribed: (channel: string) => boolean;
  isAnyChannelSubscribed: boolean;
  setChannelPreference: (
    channel: string,
    minSignificance: HighlightSignificance | null,
  ) => Promise<void>;
  subscribeAll: (minSignificance: HighlightSignificance) => Promise<void>;
};

export const useChannelHighlightPreferences =
  (): UseChannelHighlightPreferencesResult => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [pendingCount, setPendingCount] = useState(0);

    const { data, isLoading } = useQuery<ChannelConfigurationsData>({
      ...channelHighlightPreferencesQueryOptions(),
      enabled: !!user,
    });

    const channels = useMemo(() => data?.channelConfigurations ?? [], [data]);

    const mutation = useMutation({
      mutationFn: (vars: {
        channel: string;
        minSignificance: HighlightSignificance | null;
      }) =>
        gqlClient.request(SET_CHANNEL_HIGHLIGHT_PREFERENCE_MUTATION, {
          channel: vars.channel,
          minSignificance: vars.minSignificance,
        }),
      onMutate: async ({ channel, minSignificance }) => {
        await queryClient.cancelQueries({
          queryKey: CHANNEL_HIGHLIGHT_PREFERENCES_QUERY_KEY,
        });
        const previous = queryClient.getQueryData<ChannelConfigurationsData>(
          CHANNEL_HIGHLIGHT_PREFERENCES_QUERY_KEY,
        );
        if (previous) {
          queryClient.setQueryData<ChannelConfigurationsData>(
            CHANNEL_HIGHLIGHT_PREFERENCES_QUERY_KEY,
            {
              ...previous,
              channelConfigurations: previous.channelConfigurations.map(
                (config) =>
                  config.channel === channel
                    ? { ...config, viewerMinSignificance: minSignificance }
                    : config,
              ),
            },
          );
        }
        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            CHANNEL_HIGHLIGHT_PREFERENCES_QUERY_KEY,
            context.previous,
          );
        }
      },
    });

    const setChannelPreference = useCallback(
      async (
        channel: string,
        minSignificance: HighlightSignificance | null,
      ) => {
        if (!user) {
          return;
        }
        setPendingCount((count) => count + 1);
        try {
          await mutation.mutateAsync({ channel, minSignificance });
        } finally {
          setPendingCount((count) => Math.max(0, count - 1));
        }
      },
      [user, mutation],
    );

    const subscribeAll = useCallback(
      async (minSignificance: HighlightSignificance) => {
        if (!user || channels.length === 0) {
          return;
        }
        await Promise.all(
          channels.map((config) =>
            setChannelPreference(config.channel, minSignificance),
          ),
        );
      },
      [user, channels, setChannelPreference],
    );

    const getMinSignificance = useCallback(
      (channel: string) =>
        channels.find((config) => config.channel === channel)
          ?.viewerMinSignificance ?? null,
      [channels],
    );

    const isChannelSubscribed = useCallback(
      (channel: string) => !!getMinSignificance(channel),
      [getMinSignificance],
    );

    const isAnyChannelSubscribed = useMemo(
      () => channels.some((config) => !!config.viewerMinSignificance),
      [channels],
    );

    return {
      channels,
      isLoading,
      isPending: pendingCount > 0,
      getMinSignificance,
      isChannelSubscribed,
      isAnyChannelSubscribed,
      setChannelPreference,
      subscribeAll,
    };
  };
