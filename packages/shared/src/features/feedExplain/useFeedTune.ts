import { useCallback, useMemo } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import type {
  FeedControl,
  FeedControlsDraft,
  FeedSourceMode,
  FeedTuneTab,
} from './types';
import { FeedTopicMode } from './types';
import type { ControlValue, UseFeedControls } from './useFeedControls';
import { useFeedControls } from './useFeedControls';
import { getExpiresAt } from './duration';

export type TuneChange =
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

interface UseFeedTuneState {
  /** The open tab; Tune is closed without one. */
  tab: FeedTuneTab | null;
  isOpen: boolean;
  setTab: (tab: FeedTuneTab) => void;
  changes: TuneChange[];
  setChanges: (changes: TuneChange[]) => void;
  /** What the feed ranks with while Tune is open, on top of the saved controls. */
  draft: FeedControlsDraft;
  hasChanges: boolean;
  /** Leaves Tune, dropping what was not saved. */
  close: () => void;
}

/**
 * Tune's open tab and draft, kept with the feed's query state so the panel,
 * the feed it re-ranks and the cards it moves all read the same one.
 */
export const useFeedTuneState = (): UseFeedTuneState => {
  const [tab, setTab] = useQueryState<FeedTuneTab | null>({
    key: [QueryStateKeys.FeedTune],
    defaultValue: null,
  });
  const [changes, setChanges] = useQueryState<TuneChange[]>({
    key: [QueryStateKeys.FeedTuneChanges],
    defaultValue: [],
  });
  const draft = useMemo(() => toDraft(changes), [changes]);
  const close = useCallback(() => {
    setTab(null);
    setChanges([]);
  }, [setTab, setChanges]);

  return {
    tab,
    isOpen: !!tab,
    setTab,
    changes,
    setChanges,
    draft,
    hasChanges: changes.length > 0,
    close,
  };
};

export interface UseFeedTune extends UseFeedTuneState {
  feedControls: UseFeedControls;
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
  /** Saves every change in the draft, in order, and leaves Tune. */
  save: () => void;
}

/**
 * Tune's controls: changes held as a draft the feed beside them ranks with,
 * saved together or dropped on close.
 */
export const useFeedTune = (): UseFeedTune => {
  const state = useFeedTuneState();
  const { changes, setChanges, close } = state;
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
    close();
  };

  return {
    ...state,
    feedControls,
    changeCount: latest.size,
    getTopicControl,
    getSourceControl,
    getRankingValue,
    learning,
    setTopic: (keyword, value) => add({ kind: 'topic', keyword, value }),
    setSource: (sourceId, value) => add({ kind: 'source', sourceId, value }),
    setRanking: (key, value) => add({ kind: 'ranking', key, value }),
    setLearning: (enabled) => add({ kind: 'learning', enabled }),
    undo: () => setChanges(changes.slice(0, -1)),
    save,
  };
};
