export type ArenaGroupId = 'coding-agents' | 'llms';

export type ArenaTab = 'coding-agents' | 'llms';

export interface SentimentTimeSeriesNode {
  entity: string;
  timestamps: number[];
  scores: number[];
  volume: number[];
  scoreVariance: number[];
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
}

export interface ArenaEntity {
  entity: string;
  name: string;
  slug: string;
  logo: string;
  brandColor: string;
}

export type CrownType =
  | 'developers-choice'
  | 'most-loved'
  | 'fastest-rising'
  | 'most-discussed'
  | 'most-controversial';

export interface CrownData {
  type: CrownType;
  emoji: string;
  label: string;
  entity: ArenaEntity | null;
  stat: string;
  heldSince: number | null;
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
