export enum ChatterPlatform {
  X = 'x',
  HackerNews = 'hackernews',
  Reddit = 'reddit',
}

export type ChatterMoodTone = 'hot' | 'split' | 'mixed' | 'positive';

export interface ChatterComment {
  id: string;
  author: string;
  handle?: string;
  // Placeholder avatar background (CSS color/gradient) until real avatars exist.
  avatar: string;
  timeAgo: string;
  text: string;
  upvotes?: number;
  replies?: number;
}

export interface ChatterStat {
  label: string;
  value: string;
}

export interface ChatterSource {
  platform: ChatterPlatform;
  heading: string;
  subtitle: string;
  stats: ChatterStat[];
  /** Short bold lead for the AI summary, e.g. "X is on fire." */
  mood: string;
  moodTone: ChatterMoodTone;
  /** The AI-generated TLDR body. */
  summary: string;
  sourceUrl: string;
  sourceLabel: string;
  comments: ChatterComment[];
  /** Whether the comment list starts expanded. */
  defaultOpen?: boolean;
}

export type CommunityStance = 'positive' | 'divided' | 'critical' | 'mixed';
export type ControversyLevel = 'calm' | 'lively' | 'heated';
export type CommunityMomentum = 'rising' | 'steady' | 'cooling';

export interface SentimentSplit {
  agree: number;
  mixed: number;
  disagree: number;
}

export interface PlatformSentiment {
  platform: ChatterPlatform;
  /** One-word read of the platform's mood, e.g. "Skeptical". */
  read: string;
  split: SentimentSplit;
}

export type HighlightKind =
  | 'the-bull-case'
  | 'the-skeptic'
  | 'the-tell'
  | 'the-receipt';

export interface CommunityHighlight {
  kind: HighlightKind;
  text: string;
  who: string;
}

export interface CommunityPulse {
  verdict: string;
  stance: CommunityStance;
  controversyLevel: ControversyLevel;
  totalVoices: number;
  momentum: CommunityMomentum;
  overallSplit: SentimentSplit;
  perPlatform: PlatformSentiment[];
  /** The fault lines the community splits on. */
  contention: string[];
  /** The standout quotes, tagged by their role in the conversation. */
  highlights: CommunityHighlight[];
  /** One-sentence synthesized takeaway. */
  bottomLine: string;
}

export interface ArticleChatter {
  pulse: CommunityPulse;
  sources: ChatterSource[];
}
