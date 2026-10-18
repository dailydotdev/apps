import { createContext, useContext } from 'react';
import type { Decision } from '../policy/rank';

export enum ControlSection {
  Overview = 'overview',
  Learning = 'learning',
  Filling = 'filling',
  Interests = 'interests',
  Sources = 'sources',
  Ranking = 'ranking',
  Reset = 'reset',
}

interface FeedScreenValue {
  /** Opens the full "Why am I seeing this?" explanation. */
  onOpenDetails?: (decision: Decision) => void;
  /** Opens the personalization controls, at a section. */
  onOpenControls?: (section?: ControlSection) => void;
}

export const FeedScreenContext = createContext<FeedScreenValue>({});

export const useFeedScreen = (): FeedScreenValue =>
  useContext(FeedScreenContext);
