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
import type { FeedControl, FeedControlDuration, FeedControls } from './types';
import { FeedSourceMode, FeedTopicMode } from './types';
import type { FeedPersonalizationReset } from './graphql';
import {
  resetFeedPersonalization,
  resetFeedRankingSettings,
  setFeedFillIns,
  setFeedLearning,
  setFeedRankingSetting,
  setFeedSourceMode,
  setFeedSourceWeight,
  setFeedTopicMode,
  setFeedTopicWeight,
} from './graphql';
import { getExpiresAt } from './duration';
import { feedControlsQueryKey, feedControlsQueryOptions } from './queries';
import { useDropIdleForYouFeeds } from './useDropIdleForYouFeeds';
import { SharedFeedPage } from '../../components/utilities/common';

enum ChangeKind {
  Topic = 'topic',
  Source = 'source',
  Learning = 'learning',
  FillIns = 'fill_ins',
  Ranking = 'ranking',
  RankingReset = 'ranking_reset',
}

/** A level or an exact weight (Plus), for a while (Plus) or for good. */
export interface ControlValue<Mode> {
  mode?: Mode | null;
  weight?: number;
  duration?: FeedControlDuration;
}

type FeedControlChange =
  | ({ kind: ChangeKind.Topic; keyword: string } & ControlValue<FeedTopicMode>)
  | ({ kind: ChangeKind.Source; sourceId: string } & ControlValue<FeedSourceMode>)
  | { kind: ChangeKind.Learning | ChangeKind.FillIns; enabled: boolean }
  | { kind: ChangeKind.Ranking; key: string; value: number | null }
  | { kind: ChangeKind.RankingReset };

// Mirrors how the API stores it: an exact weight of 0 is the off level.
const toStored = <Mode>(
  { mode, weight, duration }: ControlValue<Mode>,
  off?: Mode,
): FeedControl<Mode> | null => {
  if (weight === undefined && !mode) {
    return null;
  }
  return {
    mode: weight === 0 && off ? off : (mode ?? null),
    weight: weight ? weight : null,
    expiresAt: getExpiresAt(duration),
  };
};

const applyChange = (
  controls: FeedControls,
  change: FeedControlChange,
): FeedControls => {
  switch (change.kind) {
    case ChangeKind.Topic: {
      const topics = controls.topics.filter(
        ({ keyword }) => keyword !== change.keyword,
      );
      const stored = toStored(change, FeedTopicMode.Off);
      return {
        ...controls,
        topics: stored
          ? [...topics, { keyword: change.keyword, ...stored }]
          : topics,
      };
    }
    case ChangeKind.Source: {
      const sources = controls.sources.filter(
        ({ source }) => source.id !== change.sourceId,
      );
      const stored = toStored(change);
      return {
        ...controls,
        sources: stored
          ? [...sources, { source: { id: change.sourceId }, ...stored }]
          : sources,
      };
    }
    case ChangeKind.Learning:
      return { ...controls, learning: change.enabled };
    case ChangeKind.FillIns:
      return { ...controls, fillIns: change.enabled };
    case ChangeKind.Ranking: {
      const ranking = controls.ranking.filter(({ key }) => key !== change.key);
      return {
        ...controls,
        ranking:
          change.value === null
            ? ranking
            : [...ranking, { key: change.key, value: change.value }],
      };
    }
    default:
      return { ...controls, ranking: [] };
  }
};

const sendChange = (change: FeedControlChange): Promise<unknown> => {
  switch (change.kind) {
    case ChangeKind.Topic:
      return change.weight === undefined
        ? setFeedTopicMode(change.keyword, change.mode ?? null, change.duration)
        : setFeedTopicWeight(change.keyword, change.weight, change.duration);
    case ChangeKind.Source:
      return change.weight === undefined
        ? setFeedSourceMode(
            change.sourceId,
            change.mode ?? null,
            change.duration,
          )
        : setFeedSourceWeight(change.sourceId, change.weight, change.duration);
    case ChangeKind.Learning:
      return setFeedLearning(change.enabled);
    case ChangeKind.FillIns:
      return setFeedFillIns(change.enabled);
    case ChangeKind.Ranking:
      return setFeedRankingSetting(change.key, change.value);
    default:
      return resetFeedRankingSettings();
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
        extra: JSON.stringify({
          origin,
          mode:
            change.weight === undefined ? change.mode ?? 'auto' : 'weight',
          weight: change.weight,
          duration: change.duration,
        }),
      };
    case ChangeKind.Ranking:
      return {
        event_name: LogEvent.SetFeedRankingSetting,
        target_id: change.key,
        extra: JSON.stringify({ origin, value: change.value }),
      };
    case ChangeKind.RankingReset:
      return {
        event_name: LogEvent.ResetFeedRankingSettings,
        extra: JSON.stringify({ origin }),
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

// The limits come back as validation errors written for the reader, and a
// Plus control after Plus ended as forbidden.
const getErrorMessage = (error: unknown): string =>
  findApiError(error, ApiError.GraphqlValidationFailed)?.message ??
  findApiError(error, ApiError.Forbidden)?.message ??
  labels.error.generic;

interface UseFeedControlsProps {
  origin: Origin;
  /** Read the controls, for callers that show them. */
  enabled?: boolean;
}

export interface UseFeedControls {
  controls?: FeedControls;
  getTopicMode: (keyword: string) => FeedTopicMode | undefined;
  getTopicControl: (keyword: string) => FeedControl<FeedTopicMode> | undefined;
  getSourceControl: (
    sourceId: string,
  ) => FeedControl<FeedSourceMode> | undefined;
  isSourceDemoted: (sourceId: string) => boolean;
  setTopicMode: (keyword: string, mode: FeedTopicMode | null) => void;
  setSourceMode: (sourceId: string, mode: FeedSourceMode | null) => void;
  /** A level or an exact weight, for a while or for good. */
  setTopic: (keyword: string, value: ControlValue<FeedTopicMode>) => void;
  setSource: (sourceId: string, value: ControlValue<FeedSourceMode>) => void;
  setLearning: (enabled: boolean) => void;
  setFillIns: (enabled: boolean) => void;
  /** No value takes the setting back to the default. */
  setRankingSetting: (key: string, value: number | null) => void;
  resetRankingSettings: () => void;
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
    // One change at a time, so a rollback never undoes a later change and
    // a quick double click lands in order.
    scope: { id: RequestKey.FeedControls },
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
    // Not awaited: the next change in the queue shouldn't wait for it.
    onSettled: () => {
      client.invalidateQueries({ queryKey });
    },
    onSuccess: (_, change) => {
      logEvent(getChangeEvent(change, origin));
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.FeedProfile, user),
      });
      dropIdleFeeds();
    },
  });

  const getTopicControl = useCallback(
    (keyword: string) =>
      controls?.topics.find((topic) => topic.keyword === keyword),
    [controls],
  );
  const getTopicMode = useCallback(
    (keyword: string) => getTopicControl(keyword)?.mode ?? undefined,
    [getTopicControl],
  );
  const getSourceControl = useCallback(
    (sourceId: string) =>
      controls?.sources.find(({ source }) => source.id === sourceId),
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
  const setTopic = useCallback(
    (keyword: string, value: ControlValue<FeedTopicMode>) =>
      mutate({ kind: ChangeKind.Topic, keyword, ...value }),
    [mutate],
  );
  const setSource = useCallback(
    (sourceId: string, value: ControlValue<FeedSourceMode>) =>
      mutate({ kind: ChangeKind.Source, sourceId, ...value }),
    [mutate],
  );
  const setRankingSetting = useCallback(
    (key: string, value: number | null) =>
      mutate({ kind: ChangeKind.Ranking, key, value }),
    [mutate],
  );
  const resetRankingSettings = useCallback(
    () => mutate({ kind: ChangeKind.RankingReset }),
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
    getTopicControl,
    getSourceControl,
    isSourceDemoted,
    setTopicMode,
    setSourceMode,
    setTopic,
    setSource,
    setLearning,
    setFillIns,
    setRankingSetting,
    resetRankingSettings,
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
