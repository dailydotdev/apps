import type { ComponentType } from 'react';
import type { IconProps } from '../../../components/Icon';

export type ArenaGroupId = 'coding-agents' | 'llms';

export type ArenaTab = 'coding-agents' | 'llms';

export interface SentimentTimeSeriesNode {
  entity: string;
  timestamps: number[];
  scores: number[];
  volume: number[];
  scoreVariance: number[];
  dIndex: number[];
}

export interface SentimentTimeSeries {
  start: string;
  resolutionSeconds: number;
  entities: {
    nodes: SentimentTimeSeriesNode[];
  };
}

export interface ArenaQueryResponse {
  sentimentTimeSeries: SentimentTimeSeries;
  sentimentHighlights: SentimentHighlightsConnection;
  sentimentGroup: SentimentGroup | null;
}

export interface ArenaEntity {
  entity: string;
  name: string;
  logo: string;
}

export interface SentimentGroup {
  id: string;
  name: string;
  entities: ArenaEntity[];
}

export type CrownType =
  | 'developers-choice'
  | 'most-loved'
  | 'fastest-rising'
  | 'most-discussed'
  | 'most-controversial';

export interface CrownData {
  type: CrownType;
  icon: ComponentType<IconProps>;
  iconColor: string;
  glowColor: string;
  label: string;
  entity: ArenaEntity | null;
  stat: string;
}

export interface RankedTool {
  entity: ArenaEntity;
  dIndex: number;
  sentimentDisplay: number;
  momentum: number;
  volume24h: number;
  controversyScore: number;
  heat: number;
  sparkline: number[];
  isEmerging: boolean;
}

export interface SentimentHighlightAuthor {
  id?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
}

export interface SentimentHighlightMetrics {
  likeCount?: number;
  replyCount?: number;
  retweetCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
  impressionCount?: number;
}

export interface SentimentAnnotation {
  entity: string;
  score: number;
  highlightScore: number;
}

export interface SentimentHighlightItem {
  provider: string;
  externalItemId: string;
  url: string;
  text: string;
  author?: SentimentHighlightAuthor;
  metrics?: SentimentHighlightMetrics;
  createdAt: string;
  sentiments: SentimentAnnotation[];
}

export interface SentimentHighlightsConnection {
  items: SentimentHighlightItem[];
  cursor?: string;
}
