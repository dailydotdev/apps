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
  /** Turns Explain on and scrolls to a post's card. */
  onExplainCard?: (postId: string) => void;
  /** Set while a downvote opens the card's explanation; cleared by "Don't ask again". */
  onStopAskingAfterDownvote?: () => void;
}

export const FeedScreenContext = createContext<FeedScreenValue>({});

export const useFeedScreen = (): FeedScreenValue =>
  useContext(FeedScreenContext);
