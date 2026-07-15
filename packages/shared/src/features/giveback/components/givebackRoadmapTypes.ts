import type { ContributionRewardType } from '../types';

// A reward tier reshaped into a roadmap node. Every tier grants a reward, so the
// node always has one.
export interface RoadmapLevel {
  id: string;
  levelNumber: number;
  requiredApprovedAmount: number;
  reward: {
    id: string;
    type: ContributionRewardType;
    title: string;
    description: string | null;
  };
}

// How a connector segment between two nodes is filled: fully cleared (green),
// the live segment leading up to you (partial cabbage), or not yet reached.
export type ConnectorFill =
  | { type: 'full' }
  | { type: 'partial'; progress: number }
  | { type: 'muted' };

export interface RoadmapNode {
  level: RoadmapLevel;
  isLast: boolean;
  isReached: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isClaimed: boolean;
  connector?: ConnectorFill;
}
