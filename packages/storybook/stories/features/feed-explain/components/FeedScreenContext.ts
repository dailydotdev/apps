import { createContext, useContext } from 'react';
import type { Decision } from '../policy/rank';

export enum ControlSection {
  Overview = 'overview',
  Interests = 'interests',
  Sources = 'sources',
  Ranking = 'ranking',
  LeftOut = 'left-out',
  Settings = 'settings',
  Reset = 'reset',
}

interface FeedScreenValue {
  /** How many posts on screen carry each signal key. */
  counts: Record<string, number>;
  /** Opens the full "Why am I seeing this?" explanation. */
  onOpenDetails?: (decision: Decision) => void;
  /** Opens the personalization controls, at a section. */
  onOpenControls?: (section?: ControlSection) => void;
}

export const FeedScreenContext = createContext<FeedScreenValue>({
  counts: {},
});

export const useFeedScreen = (): FeedScreenValue =>
  useContext(FeedScreenContext);

export const getSignalCounts = (
  decisions: Decision[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  decisions.forEach(({ post }) => {
    [
      ...(post.tags ?? []).map((tag) => `topic:${tag}`),
      ...(post.source?.id ? [`source:${post.source.id}`] : []),
    ].forEach((key) => {
      counts[key] = (counts[key] ?? 0) + 1;
    });
  });
  return counts;
};
