import { useCallback, useMemo } from 'react';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import type {
  FeedAuthorMode,
  FeedControlsDraft,
  FeedSourceMode,
  FeedTopicMode,
  FeedTuneTab,
} from './types';
import type { ControlValue } from './useFeedControls';

export type TuneChange =
  | { kind: 'topic'; keyword: string; value: ControlValue<FeedTopicMode> }
  | { kind: 'source'; sourceId: string; value: ControlValue<FeedSourceMode> }
  | { kind: 'author'; userId: string; value: ControlValue<FeedAuthorMode> }
  | { kind: 'ranking'; key: string; value: number | null }
  | { kind: 'learning'; enabled: boolean };

export const changeKey = (change: TuneChange): string => {
  switch (change.kind) {
    case 'topic':
      return `topic:${change.keyword}`;
    case 'source':
      return `source:${change.sourceId}`;
    case 'author':
      return `author:${change.userId}`;
    case 'ranking':
      return `ranking:${change.key}`;
    default:
      return 'learning';
  }
};

// The latest change to each control, in the order they were first made.
export const latestChanges = (changes: TuneChange[]): TuneChange[] => [
  ...new Map(changes.map((change) => [changeKey(change), change])).values(),
];

// The controls whose latest change differs from the one last previewed,
// including a change undone past the preview.
const countPending = (
  changes: TuneChange[],
  previewed: TuneChange[],
): number => {
  const byKey = (list: TuneChange[]) =>
    new Map(latestChanges(list).map((c) => [changeKey(c), JSON.stringify(c)]));
  const latest = byKey(changes);
  const shown = byKey(previewed);
  return [...new Set([...latest.keys(), ...shown.keys()])].filter(
    (key) => latest.get(key) !== shown.get(key),
  ).length;
};

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
      case 'author':
        return {
          ...draft,
          authors: [
            ...(draft.authors ?? []),
            { userId: change.userId, ...toDraftEntry(change.value) },
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

export interface UseFeedTuneState {
  /** The open tab; Tune is closed without one. */
  tab: FeedTuneTab | null;
  isOpen: boolean;
  setTab: (tab: FeedTuneTab) => void;
  changes: TuneChange[];
  setChanges: (changes: TuneChange[]) => void;
  /**
   * What the feed ranks with while Tune is open, on top of the saved
   * controls: the changes as they were last previewed.
   */
  previewDraft: FeedControlsDraft;
  hasPreview: boolean;
  /** Changes since the last preview, which the feed does not show yet. */
  pendingCount: number;
  /** Ranks the feed with every change made so far. */
  preview: () => void;
  /** Leaves Tune, dropping what was not saved. */
  close: () => void;
}

/**
 * Tune's open tab, draft and preview, kept with the feed's query state so
 * the panel, the feed it re-ranks and the cards it moves all read the same
 * one.
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
  const [previewed, setPreviewed] = useQueryState<TuneChange[]>({
    key: [QueryStateKeys.FeedTunePreviewed],
    defaultValue: [],
  });
  const previewDraft = useMemo(() => toDraft(previewed), [previewed]);
  const pendingCount = useMemo(
    () => countPending(changes, previewed),
    [changes, previewed],
  );
  const preview = useCallback(
    () => setPreviewed(changes),
    [setPreviewed, changes],
  );
  const close = useCallback(() => {
    setTab(null);
    setChanges([]);
    setPreviewed([]);
  }, [setTab, setChanges, setPreviewed]);

  return {
    tab,
    isOpen: !!tab,
    setTab,
    changes,
    setChanges,
    previewDraft,
    hasPreview: previewed.length > 0,
    pendingCount,
    preview,
    close,
  };
};
