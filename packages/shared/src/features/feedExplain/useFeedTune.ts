import { useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import type {
  FeedControl,
  FeedControlsDraft,
  FeedSourceMode,
  FeedTune,
} from './types';
import { FeedTopicMode } from './types';
import type { ControlValue, UseFeedControls } from './useFeedControls';
import { useFeedControls } from './useFeedControls';
import { feedTuneQueryOptions } from './queries';
import { getExpiresAt } from './duration';

type TuneChange =
  | { kind: 'topic'; keyword: string; value: ControlValue<FeedTopicMode> }
  | { kind: 'source'; sourceId: string; value: ControlValue<FeedSourceMode> }
  | { kind: 'ranking'; key: string; value: number | null }
  | { kind: 'learning'; enabled: boolean };

const changeKey = (change: TuneChange): string => {
  switch (change.kind) {
    case 'topic':
      return `topic:${change.keyword}`;
    case 'source':
      return `source:${change.sourceId}`;
    case 'ranking':
      return `ranking:${change.key}`;
    default:
      return 'learning';
  }
};

// The latest change to each control, in the order they were first made.
const latestChanges = (changes: TuneChange[]): TuneChange[] => [
  ...new Map(changes.map((change) => [changeKey(change), change])).values(),
];

const toDraftEntry = <Mode>({ mode, weight }: ControlValue<Mode>) => ({
  ...(mode && { mode }),
  ...(weight !== undefined && { weight }),
});

const toDraft = (changes: TuneChange[]): FeedControlsDraft =>
  latestChanges(changes).reduce<FeedControlsDraft>((draft, change) => {
    switch (change.kind) {
      case 'topic':
        return {
          ...draft,
          topics: [
            ...(draft.topics ?? []),
            { keyword: change.keyword, ...toDraftEntry(change.value) },
          ],
        };
      case 'source':
        return {
          ...draft,
          sources: [
            ...(draft.sources ?? []),
            { sourceId: change.sourceId, ...toDraftEntry(change.value) },
          ],
        };
      case 'ranking':
        return {
          ...draft,
          ranking: [
            ...(draft.ranking ?? []),
            {
              key: change.key,
              ...(change.value !== null && { value: change.value }),
            },
          ],
        };
      default:
        return { ...draft, learning: change.enabled };
    }
  }, {});

const toControl = <Mode>(
  { mode, weight, duration }: ControlValue<Mode>,
  off?: Mode,
): FeedControl<Mode> | undefined =>
  mode || weight !== undefined
    ? {
        mode: weight === 0 && off ? off : mode ?? null,
        weight: weight || null,
        expiresAt: getExpiresAt(duration),
      }
    : undefined;

/** One line on how the page moved from the feed as it is. */
const describeMovement = (
  base: FeedTune | undefined,
  preview: FeedTune | undefined,
): string | undefined => {
  if (!base || !preview) {
    return undefined;
  }
  const before = new Map(
    base.items.map(({ post }, index) => [post?.id, index]),
  );
  const after = new Set(preview.items.map(({ post }) => post?.id));
  const incoming = preview.items.filter(({ post }) => !before.has(post?.id));
  const moved = preview.items.filter(
    ({ post }, index) => before.has(post?.id) && before.get(post?.id) !== index,
  );
  const left = base.items.filter(({ post }) => !after.has(post?.id));
  const parts = [
    incoming.length &&
      `${incoming.length} new ${incoming.length === 1 ? 'post' : 'posts'}`,
    moved.length && `${moved.length} moved`,
    left.length && `${left.length} left the page`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(', ')}.` : 'Nothing moved on the page.';
};

export interface UseFeedTune {
  feedControls: UseFeedControls;
  base?: FeedTune;
  preview?: FeedTune;
  isPreviewing: boolean;
  isFetching: boolean;
  movement?: string;
  changeCount: number;
  getTopicControl: (keyword: string) => FeedControl<FeedTopicMode> | undefined;
  getSourceControl: (
    sourceId: string,
  ) => FeedControl<FeedSourceMode> | undefined;
  getRankingValue: (key: string) => number | undefined;
  learning: boolean;
  setTopic: (keyword: string, value: ControlValue<FeedTopicMode>) => void;
  setSource: (sourceId: string, value: ControlValue<FeedSourceMode>) => void;
  setRanking: (key: string, value: number | null) => void;
  setLearning: (enabled: boolean) => void;
  undo: () => void;
  /** Saves every change in the draft, in order. */
  save: () => void;
}

/**
 * Tune: changes to the For You controls held as a draft and previewed on a
 * fresh feed before anything is saved, beside the feed as it is now.
 */
export const useFeedTune = (version: number): UseFeedTune => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const feedControls = useFeedControls({ origin: Origin.FeedTune });
  const [changes, setChanges] = useState<TuneChange[]>([]);
  const draft = useMemo(() => toDraft(changes), [changes]);
  const isPreviewing = changes.length > 0;
  const { data: base, isFetching: isFetchingBase } = useQuery(
    feedTuneQueryOptions({ user, version, draft: {} }),
  );
  const previewOptions = feedTuneQueryOptions({ user, version, draft });
  const { data: preview, isFetching: isFetchingPreview } = useQuery({
    ...previewOptions,
    enabled: previewOptions.enabled && isPreviewing,
    placeholderData: keepPreviousData,
  });
  const latest = useMemo(
    () => new Map(latestChanges(changes).map((c) => [changeKey(c), c])),
    [changes],
  );

  const getTopicControl = useCallback(
    (keyword: string) => {
      const change = latest.get(`topic:${keyword}`);
      return change?.kind === 'topic'
        ? toControl(change.value, FeedTopicMode.Off)
        : feedControls.getTopicControl(keyword);
    },
    [latest, feedControls],
  );
  const getSourceControl = useCallback(
    (sourceId: string) => {
      const change = latest.get(`source:${sourceId}`);
      return change?.kind === 'source'
        ? toControl(change.value)
        : feedControls.getSourceControl(sourceId);
    },
    [latest, feedControls],
  );
  const getRankingValue = useCallback(
    (key: string) => {
      const change = latest.get(`ranking:${key}`);
      if (change?.kind === 'ranking') {
        return change.value ?? undefined;
      }
      return feedControls.controls?.ranking.find((item) => item.key === key)
        ?.value;
    },
    [latest, feedControls.controls],
  );
  const learningChange = latest.get('learning');
  const learning =
    learningChange?.kind === 'learning'
      ? learningChange.enabled
      : feedControls.controls?.learning ?? true;

  const add = (change: TuneChange) => setChanges((list) => [...list, change]);

  const save = () => {
    const saved = latestChanges(changes);
    saved.forEach((change) => {
      switch (change.kind) {
        case 'topic':
          feedControls.setTopic(change.keyword, change.value);
          break;
        case 'source':
          feedControls.setSource(change.sourceId, change.value);
          break;
        case 'ranking':
          feedControls.setRankingSetting(change.key, change.value);
          break;
        default:
          feedControls.setLearning(change.enabled);
      }
    });
    if (saved.length) {
      logEvent({
        event_name: LogEvent.SaveFeedTune,
        extra: JSON.stringify({ changes: saved.length }),
      });
    }
    setChanges([]);
  };

  return {
    feedControls,
    base,
    preview: isPreviewing ? preview : base,
    isPreviewing,
    isFetching: isFetchingBase || isFetchingPreview,
    movement: isPreviewing ? describeMovement(base, preview) : undefined,
    changeCount: latest.size,
    getTopicControl,
    getSourceControl,
    getRankingValue,
    learning,
    setTopic: (keyword, value) => add({ kind: 'topic', keyword, value }),
    setSource: (sourceId, value) => add({ kind: 'source', sourceId, value }),
    setRanking: (key, value) => add({ kind: 'ranking', key, value }),
    setLearning: (enabled) => add({ kind: 'learning', enabled }),
    undo: () => setChanges((list) => list.slice(0, -1)),
    save,
  };
};
