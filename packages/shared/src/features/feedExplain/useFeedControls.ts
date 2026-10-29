import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { labels } from '../../lib/labels';
import type { LogEvent as LogEventPayload } from '../../hooks/log/useLogQueue';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetId } from '../../lib/log';
import type { FeedControls, FeedTopicMode } from './types';
import { FeedSourceMode } from './types';
import type { FeedPersonalizationReset } from './graphql';
import {
  resetFeedPersonalization,
  setFeedFillIns,
  setFeedLearning,
  setFeedSourceMode,
  setFeedTopicMode,
} from './graphql';
import { feedControlsQueryKey, feedControlsQueryOptions } from './queries';
import { useDropIdleForYouFeeds } from './useDropIdleForYouFeeds';
import { SharedFeedPage } from '../../components/utilities/common';

enum ChangeKind {
  Topic = 'topic',
  Source = 'source',
  Learning = 'learning',
  FillIns = 'fill_ins',
}

type FeedControlChange =
  | { kind: ChangeKind.Topic; keyword: string; mode: FeedTopicMode | null }
  | { kind: ChangeKind.Source; sourceId: string; mode: FeedSourceMode | null }
  | { kind: ChangeKind.Learning | ChangeKind.FillIns; enabled: boolean };

const applyChange = (
  controls: FeedControls,
  change: FeedControlChange,
): FeedControls => {
  switch (change.kind) {
    case ChangeKind.Topic: {
      const topics = controls.topics.filter(
        ({ keyword }) => keyword !== change.keyword,
      );
      return {
        ...controls,
        topics: change.mode
          ? [...topics, { keyword: change.keyword, mode: change.mode }]
          : topics,
      };
    }
    case ChangeKind.Source: {
      const sources = controls.sources.filter(
        ({ source }) => source.id !== change.sourceId,
      );
      return {
        ...controls,
        sources: change.mode
          ? [...sources, { source: { id: change.sourceId }, mode: change.mode }]
          : sources,
      };
    }
    case ChangeKind.Learning:
      return { ...controls, learning: change.enabled };
    default:
      return { ...controls, fillIns: change.enabled };
  }
};

const sendChange = (change: FeedControlChange): Promise<unknown> => {
  switch (change.kind) {
    case ChangeKind.Topic:
      return setFeedTopicMode(change.keyword, change.mode);
    case ChangeKind.Source:
      return setFeedSourceMode(change.sourceId, change.mode);
    case ChangeKind.Learning:
      return setFeedLearning(change.enabled);
    default:
      return setFeedFillIns(change.enabled);
  }
};

const getChangeEvent = (
  change: FeedControlChange,
  origin: Origin,
): LogEventPayload => {
  switch (change.kind) {
    case ChangeKind.Topic:
    case ChangeKind.Source:
      return {
        event_name:
          change.kind === ChangeKind.Topic
            ? LogEvent.SetFeedTopicMode
            : LogEvent.SetFeedSourceMode,
        target_id:
          change.kind === ChangeKind.Topic ? change.keyword : change.sourceId,
        extra: JSON.stringify({ origin, mode: change.mode ?? 'auto' }),
      };
    default:
      return {
        event_name:
          change.kind === ChangeKind.Learning
            ? LogEvent.ToggleFeedLearning
            : LogEvent.ToggleFeedFillIns,
        target_id: change.enabled ? TargetId.On : TargetId.Off,
        extra: JSON.stringify({ origin }),
      };
  }
};

const findApiError = (error: unknown, code: ApiError) =>
  getApiError(error as ApiErrorResult, code);

// The limits come back as validation errors written for the reader.
const getErrorMessage = (error: unknown): string =>
  findApiError(error, ApiError.GraphqlValidationFailed)?.message ??
  labels.error.generic;

interface UseFeedControlsProps {
  origin: Origin;
  /** Read the controls, for callers that show them. */
  enabled?: boolean;
}

export interface UseFeedControls {
  controls?: FeedControls;
  getTopicMode: (keyword: string) => FeedTopicMode | undefined;
  isSourceDemoted: (sourceId: string) => boolean;
  setTopicMode: (keyword: string, mode: FeedTopicMode | null) => void;
  setSourceMode: (sourceId: string, mode: FeedSourceMode | null) => void;
  setLearning: (enabled: boolean) => void;
  setFillIns: (enabled: boolean) => void;
}

/**
 * The For You controls: topic and source levels, learning and popular
 * fill-ins. A change shows at once and rolls back if it fails. It reweighs
 * the profile and drops the For You feed waiting in the cache, so the next
 * one is ranked with it.
 */
export const useFeedControls = ({
  origin,
  enabled = true,
}: UseFeedControlsProps): UseFeedControls => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const dropIdleFeeds = useDropIdleForYouFeeds();
  const queryKey = feedControlsQueryKey(user);
  const options = feedControlsQueryOptions(user);
  const { data: controls } = useQuery({
    ...options,
    enabled: options.enabled && enabled,
  });

  const { mutate } = useMutation({
    mutationFn: sendChange,
    onMutate: async (change) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<FeedControls>(queryKey);
      if (previous) {
        client.setQueryData(queryKey, applyChange(previous, change));
      }
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        client.setQueryData(queryKey, context.previous);
      }
      displayToast(getErrorMessage(error));
    },
    onSuccess: (_, change, context) => {
      logEvent(getChangeEvent(change, origin));
      if (!context?.previous) {
        client.invalidateQueries({ queryKey });
      }
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.FeedProfile, user),
      });
      dropIdleFeeds();
    },
  });

  const getTopicMode = useCallback(
    (keyword: string) =>
      controls?.topics.find((topic) => topic.keyword === keyword)?.mode,
    [controls],
  );
  const isSourceDemoted = useCallback(
    (sourceId: string) =>
      !!controls?.sources.some(
        ({ source, mode }) =>
          source.id === sourceId && mode === FeedSourceMode.Demote,
      ),
    [controls],
  );
  const setTopicMode = useCallback(
    (keyword: string, mode: FeedTopicMode | null) =>
      mutate({ kind: ChangeKind.Topic, keyword, mode }),
    [mutate],
  );
  const setSourceMode = useCallback(
    (sourceId: string, mode: FeedSourceMode | null) =>
      mutate({ kind: ChangeKind.Source, sourceId, mode }),
    [mutate],
  );
  const setLearning = useCallback(
    (value: boolean) => mutate({ kind: ChangeKind.Learning, enabled: value }),
    [mutate],
  );
  const setFillIns = useCallback(
    (value: boolean) => mutate({ kind: ChangeKind.FillIns, enabled: value }),
    [mutate],
  );

  return {
    controls,
    getTopicMode,
    isSourceDemoted,
    setTopicMode,
    setSourceMode,
    setLearning,
    setFillIns,
  };
};

interface UseFeedPersonalizationReset {
  reset: (reset: FeedPersonalizationReset) => Promise<boolean>;
  isPending: boolean;
}

/**
 * Forgets what For You learned from the reader's reading or what they
 * scrolled past. The feed service drops their cached feeds, so every For You
 * page cached here restarts from page 1 too.
 */
export const useFeedPersonalizationReset = ({
  origin,
}: Pick<UseFeedControlsProps, 'origin'>): UseFeedPersonalizationReset => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: resetFeedPersonalization,
    onError: (error) => {
      displayToast(
        findApiError(error, ApiError.RateLimited)
          ? 'Too many resets for now. Try again in an hour.'
          : labels.error.generic,
      );
    },
    onSuccess: (_, { learned, seen }) => {
      logEvent({
        event_name: LogEvent.ResetFeedPersonalization,
        extra: JSON.stringify({ origin, learned, seen }),
      });
      client.resetQueries({
        queryKey: generateQueryKey(SharedFeedPage.MyFeed, user),
      });
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.FeedProfile, user),
      });
    },
  });

  const reset = useCallback(
    (value: FeedPersonalizationReset) =>
      mutateAsync(value).then(
        () => true,
        () => false,
      ),
    [mutateAsync],
  );

  return { reset, isPending };
};
