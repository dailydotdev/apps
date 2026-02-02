export interface AITool {
  id: string;
  name: string;
  version: string;
  company: string;
  description: string;
  tldr: string;
  category: 'coding-assistant' | 'chat' | 'api' | 'search' | 'other';
  pricing: {
    freeTier: boolean;
    startingPrice?: string;
    details: string;
  };
  install?: {
    command: string;
    type: 'npm' | 'pip' | 'brew' | 'download';
  };
  links: {
    docs?: string;
    website: string;
    changelog?: string;
  };
  sentiment: {
    score: number; // 0-100
    totalReviews: number;
  };
  trending: {
    mentions: number;
    timeframe: string; // e.g., "last 24h"
    change: number; // percentage change
  };
  topUsers: Array<{
    id: string;
    username: string;
    avatar: string;
    contributions: number;
  }>;
  pros: string[];
  cons: string[];
  alternatives: string[]; // IDs of alternative tools
  metadata: {
    lastUpdate: string;
    latestVersion: string;
  };
}

export interface TrendingInsight {
  type: 'trending' | 'favorite' | 'rising';
  toolId: string;
  toolName: string;
  message: string;
  icon: string;
}

export interface SocialMention {
  id: string;
  source: 'twitter' | 'reddit' | 'dailydev';
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
  toolId: string;
}
