import type { PropsWithChildren, ReactElement } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ExplainedPost, FeedReason, FeedSignal } from './feedExplain';
import { getSignalKey, getSignalName, SignalKind, TuneLevel } from './feedExplain';

interface LevelChange {
  type: 'level';
  signal: FeedSignal;
  from?: TuneLevel;
  to?: TuneLevel;
}

interface DismissChange {
  type: 'dismiss';
  postId: string;
  isDismissed: boolean;
}

export type TuningChange = LevelChange | DismissChange;

export type LeaveReason =
  | { type: 'blocked'; signal: Pick<FeedSignal, 'key' | 'kind' | 'label'> }
  | { type: 'dismissed' };

export type FeedFocus =
  | { type: 'reason'; reason: FeedReason }
  | { type: 'signal'; key: string };

export interface TuningSeed {
  levels?: Record<string, TuneLevel>;
  dismissed?: string[];
}

interface FeedTuningValue {
  levels: Record<string, TuneLevel>;
  /** Changes since the feed last refreshed, oldest first. */
  changes: TuningChange[];
  focus: FeedFocus | null;
  hoverKey: string | null;
  setLevel: (signal: FeedSignal, level?: TuneLevel) => void;
  setDismissed: (postId: string, isDismissed: boolean) => void;
  undo: () => void;
  commit: () => void;
  setFocus: (focus: FeedFocus | null) => void;
  setHoverKey: (key: string | null) => void;
  getLeaveReason: (item: ExplainedPost) => LeaveReason | undefined;
  getBoost: (item: ExplainedPost) => number;
}

const FeedTuningContext = createContext<FeedTuningValue | null>(null);

const getPostKeys = (item: ExplainedPost) => [
  ...(item.post.source?.id
    ? [getSignalKey(SignalKind.Source, item.post.source.id)]
    : []),
  ...(item.post.tags ?? []).map((tag) => getSignalKey(SignalKind.Topic, tag)),
];

export const FeedTuningProvider = ({
  seed,
  children,
}: PropsWithChildren<{ seed?: TuningSeed }>): ReactElement => {
  const [levels, setLevels] = useState<Record<string, TuneLevel>>(
    () => seed?.levels ?? {},
  );
  const [dismissed, setDismissedState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries((seed?.dismissed ?? []).map((id) => [id, true])),
  );
  const [changes, setChanges] = useState<TuningChange[]>([]);
  const [focus, setFocus] = useState<FeedFocus | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const value = useMemo((): FeedTuningValue => {
    const applyLevel = (key: string, level?: TuneLevel) =>
      setLevels((current) => {
        const next = { ...current };
        if (level) {
          next[key] = level;
        } else {
          delete next[key];
        }
        return next;
      });

    return {
      levels,
      changes,
      focus,
      hoverKey,
      setLevel: (signal, level) => {
        const from = levels[signal.key];
        if (from === level) {
          return;
        }
        applyLevel(signal.key, level);
        // The hovered row unmounts when blocked, so it never sees mouseleave.
        if (level === TuneLevel.Blocked) {
          setHoverKey(null);
        }
        setChanges((current) => [
          ...current,
          { type: 'level', signal, from, to: level },
        ]);
      },
      setDismissed: (postId, isDismissed) => {
        setDismissedState((current) => ({ ...current, [postId]: isDismissed }));
        setChanges((current) => [
          ...current,
          { type: 'dismiss', postId, isDismissed },
        ]);
      },
      undo: () => {
        const last = changes[changes.length - 1];
        if (!last) {
          return;
        }
        if (last.type === 'level') {
          applyLevel(last.signal.key, last.from);
        } else {
          setDismissedState((current) => ({
            ...current,
            [last.postId]: !last.isDismissed,
          }));
        }
        setChanges(changes.slice(0, -1));
      },
      commit: () => setChanges([]),
      setFocus,
      setHoverKey,
      getLeaveReason: (item) => {
        if (dismissed[item.post.id]) {
          return { type: 'dismissed' };
        }
        const blockedKey = getPostKeys(item).find(
          (key) => levels[key] === TuneLevel.Blocked,
        );
        if (!blockedKey) {
          return undefined;
        }
        const signal = item.signals.find(({ key }) => key === blockedKey);
        return signal ? { type: 'blocked', signal } : undefined;
      },
      getBoost: (item) =>
        getPostKeys(item).reduce((boost, key) => {
          if (levels[key] === TuneLevel.More) {
            return boost + 1;
          }
          return levels[key] === TuneLevel.Less ? boost - 1 : boost;
        }, 0),
    };
  }, [levels, dismissed, changes, focus, hoverKey]);

  return (
    <FeedTuningContext.Provider value={value}>
      {children}
    </FeedTuningContext.Provider>
  );
};

export const useFeedTuning = (): FeedTuningValue => {
  const value = useContext(FeedTuningContext);
  if (!value) {
    throw new Error('useFeedTuning must be used inside FeedTuningProvider');
  }
  return value;
};

export const describeChange = (change: TuningChange): string => {
  if (change.type === 'dismiss') {
    return change.isDismissed
      ? 'Got it, fewer posts like this one.'
      : 'Post is back in your feed.';
  }
  const name = getSignalName(change.signal);
  switch (change.to) {
    case TuneLevel.More:
      return `You'll see more ${name}.`;
    case TuneLevel.Less:
      return `You'll see less ${name}.`;
    case TuneLevel.Blocked:
      return `Blocked ${name}.`;
    default:
      return change.from === TuneLevel.Blocked
        ? `Unblocked ${name}.`
        : `${name} is back to normal.`;
  }
};
