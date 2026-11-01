import { useCallback, useMemo } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import type { FeedAuthorMode, FeedControl, FeedSourceMode } from './types';
import { FeedTopicMode } from './types';
import type { ControlValue, UseFeedControls } from './useFeedControls';
import { useFeedControls } from './useFeedControls';
import { getExpiresAt } from './duration';
import type { TuneChange, UseFeedTuneState } from './useFeedTuneState';
import { changeKey, latestChanges, useFeedTuneState } from './useFeedTuneState';

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

export interface UseFeedTune extends UseFeedTuneState {
  feedControls: UseFeedControls;
  changeCount: number;
  getTopicControl: (keyword: string) => FeedControl<FeedTopicMode> | undefined;
  getSourceControl: (
    sourceId: string,
  ) => FeedControl<FeedSourceMode> | undefined;
  getAuthorControl: (userId: string) => FeedControl<FeedAuthorMode> | undefined;
  getRankingValue: (key: string) => number | undefined;
  learning: boolean;
  setTopic: (keyword: string, value: ControlValue<FeedTopicMode>) => void;
  setSource: (sourceId: string, value: ControlValue<FeedSourceMode>) => void;
  setAuthor: (userId: string, value: ControlValue<FeedAuthorMode>) => void;
  setRanking: (key: string, value: number | null) => void;
  setLearning: (enabled: boolean) => void;
  undo: () => void;
  /** Saves every change in the draft, in order, and leaves Tune. */
  save: () => void;
}

/**
 * Tune's controls: changes held as a draft the feed beside them ranks with
 * once previewed, saved together or dropped on close.
 */
export const useFeedTune = (): UseFeedTune => {
  const state = useFeedTuneState();
  const { changes, setChanges, pendingCount, close } = state;
  const { logEvent } = useLogContext();
  const feedControls = useFeedControls({ origin: Origin.FeedTune });
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
  const getAuthorControl = useCallback(
    (userId: string) => {
      const change = latest.get(`author:${userId}`);
      return change?.kind === 'author'
        ? toControl(change.value)
        : feedControls.getAuthorControl(userId);
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

  const add = (change: TuneChange) => setChanges([...changes, change]);

  const preview = () => {
    if (!pendingCount) {
      return;
    }
    logEvent({
      event_name: LogEvent.PreviewFeedTune,
      extra: JSON.stringify({ changes: latest.size, pending: pendingCount }),
    });
    state.preview();
  };

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
        case 'author':
          feedControls.setAuthor(change.userId, change.value);
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
    close();
  };

  return {
    ...state,
    feedControls,
    changeCount: latest.size,
    getTopicControl,
    getSourceControl,
    getAuthorControl,
    getRankingValue,
    learning,
    setTopic: (keyword, value) => add({ kind: 'topic', keyword, value }),
    setSource: (sourceId, value) => add({ kind: 'source', sourceId, value }),
    setAuthor: (userId, value) => add({ kind: 'author', userId, value }),
    setRanking: (key, value) => add({ kind: 'ranking', key, value }),
    setLearning: (enabled) => add({ kind: 'learning', enabled }),
    undo: () => setChanges(changes.slice(0, -1)),
    preview,
    save,
    close: () => {
      logEvent({
        event_name: LogEvent.CloseFeedTune,
        extra: JSON.stringify({ changes: latest.size }),
      });
      close();
    },
  };
};
