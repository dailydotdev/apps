// Log 2025 - Type Definitions

export type Archetype =
  | 'NIGHT_OWL'
  | 'SCHOLAR'
  | 'PULSE_READER'
  | 'OPINIONIST'
  | 'COLLECTOR'
  | 'STREAK_WARRIOR';

export interface ArchetypeInfo {
  id: Archetype;
  emoji: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    emoji: '🦉',
    name: 'Night Owl',
    description: 'While others sleep, you level up.',
    color: '#4d9dff',
    imageUrl:
      'https://media.daily.dev/image/upload/s--mqo5Vxvk--/f_auto,q_auto/v1766244402/public/night_owl',
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    emoji: '📚',
    name: 'Scholar',
    description: "You don't skim. You study.",
    color: '#f7c948',
    imageUrl:
      'https://media.daily.dev/image/upload/s--mWY4TZG1--/f_auto,q_auto/v1765654630/public/scholar',
  },
  PULSE_READER: {
    id: 'PULSE_READER',
    emoji: '⚡️',
    name: 'Pulse Reader',
    description: 'First to know. Always.',
    color: '#00d4ff',
    imageUrl:
      'https://media.daily.dev/image/upload/s--XWfonwhE--/f_auto,q_auto/v1765654630/public/pulse_reader',
  },
  OPINIONIST: {
    id: 'OPINIONIST',
    emoji: '🎤',
    name: 'Opinionist',
    description: 'Others lurk. You speak up.',
    color: '#e637bf',
    imageUrl:
      'https://media.daily.dev/image/upload/s--pHpHjYtG--/f_auto,q_auto/v1765654579/public/opinionist',
  },
  COLLECTOR: {
    id: 'COLLECTOR',
    emoji: '🗃️',
    name: 'Collector',
    description: 'Nothing good escapes your vault.',
    color: '#a855f7',
    imageUrl:
      'https://media.daily.dev/image/upload/s--fMLnVbfw--/f_auto,q_auto/v1766244402/public/collector',
  },
  STREAK_WARRIOR: {
    id: 'STREAK_WARRIOR',
    emoji: '🔥',
    name: 'Streak Warrior',
    description: 'Rain or shine. You show up.',
    color: '#ff6b35',
    imageUrl:
      'https://media.daily.dev/image/upload/s--zSQmukzL--/f_auto,q_auto/v1765654630/public/streak_warrior',
  },
};

export interface TopicQuarter {
  quarter: string;
  topics: [string, string, string]; // Top 3 tags for the quarter (can have empty strings if fewer than 3)
  comment?: string; // Optional comment to display for this quarter (e.g., "🔥 THE PIVOT QUARTER")
  inactive?: boolean; // True if user had no activity this quarter
}

export interface SourceStat {
  name: string;
  postsRead: number;
  logoUrl: string;
}

// Record types based on Card 7: Your 2025 Records from AGENTS.md
export enum RecordType {
  // Time-based records
  YEAR_ACTIVE = 'yearActive', // Active X% of the year (days/365)
  STREAK = 'streak', // Longest streak
  CONSISTENT_DAY = 'consistentDay', // Most consistent day ("Read every Tuesday for 8 months")

  // Intensity records
  BINGE_DAY = 'bingeDay', // Most posts in single day
  LONGEST_SESSION = 'longestSession', // Longest reading session
  TOPIC_MARATHON = 'topicMarathon', // Topic marathon ("34 posts about System Design in one week")

  // Time-of-day records
  LATE_NIGHT = 'lateNight', // Latest night read ("3:47 AM")
  EARLY_MORNING = 'earlyMorning', // Earliest morning read ("5:12 AM")

  // Growth records
  GROWTH_MONTH = 'growthMonth', // Fastest growing month ("March was 3x your average")
  IMPROVED_TOPIC = 'improvedTopic', // Most improved topic
}

export interface RecordInfo {
  type: RecordType;
  emoji: string;
  defaultLabel: string;
}

export const RECORDS: Record<RecordType, RecordInfo> = {
  // Time-based records
  [RecordType.YEAR_ACTIVE]: {
    type: RecordType.YEAR_ACTIVE,
    emoji: '📅',
    defaultLabel: 'Active This Year',
  },
  [RecordType.STREAK]: {
    type: RecordType.STREAK,
    emoji: '🔥',
    defaultLabel: 'Longest Streak',
  },
  [RecordType.CONSISTENT_DAY]: {
    type: RecordType.CONSISTENT_DAY,
    emoji: '🎯',
    defaultLabel: 'Most Consistent Day',
  },

  // Intensity records
  [RecordType.BINGE_DAY]: {
    type: RecordType.BINGE_DAY,
    emoji: '📚',
    defaultLabel: 'Biggest Binge',
  },
  [RecordType.LONGEST_SESSION]: {
    type: RecordType.LONGEST_SESSION,
    emoji: '🏃',
    defaultLabel: 'Longest Session',
  },
  [RecordType.TOPIC_MARATHON]: {
    type: RecordType.TOPIC_MARATHON,
    emoji: '🎢',
    defaultLabel: 'Topic Marathon',
  },

  // Time-of-day records
  [RecordType.LATE_NIGHT]: {
    type: RecordType.LATE_NIGHT,
    emoji: '🌙',
    defaultLabel: 'Latest Night Read',
  },
  [RecordType.EARLY_MORNING]: {
    type: RecordType.EARLY_MORNING,
    emoji: '🌅',
    defaultLabel: 'Earliest Morning Read',
  },

  // Growth records
  [RecordType.GROWTH_MONTH]: {
    type: RecordType.GROWTH_MONTH,
    emoji: '📈',
    defaultLabel: 'Fastest Growing Month',
  },
  [RecordType.IMPROVED_TOPIC]: {
    type: RecordType.IMPROVED_TOPIC,
    emoji: '🚀',
    defaultLabel: 'Most Improved Topic',
  },
};

export interface ReadingRecord {
  type: RecordType;
  label: string;
  value: string;
  percentile?: number;
}

export interface LogData {
  // Card 1: Total Impact
  totalPosts: number;
  totalReadingTime: number; // hours
  daysActive: number;
  totalImpactPercentile: number;

  // Card 2: When You Read
  peakDay: string; // e.g., "Thursday"
  readingPattern: 'night' | 'early' | 'afternoon';
  patternPercentile: number;
  activityHeatmap: number[]; // 24 hours, values sum to 1

  // Card 3: Topic Evolution
  topicJourney: TopicQuarter[];
  uniqueTopics: number;
  evolutionPercentile: number;

  // Card 4: Favorite Sources
  topSources: [SourceStat, SourceStat, SourceStat];
  uniqueSources: number;
  sourcePercentile: number;
  sourceLoyaltyName: string;

  // Card 5: Community Engagement
  upvotesGiven: number;
  commentsWritten: number;
  postsBookmarked: number;
  upvotePercentile?: number;
  commentPercentile?: number;
  bookmarkPercentile?: number;

  // Card 6: Your Contributions (optional)
  hasContributions: boolean;
  postsCreated?: number;
  totalViews?: number;
  commentsReceived?: number;
  upvotesReceived?: number;
  reputationEarned?: number;
  creatorPercentile?: number;

  // Card 7: Records
  records: ReadingRecord[];

  // Card 8: Archetype
  archetype: Archetype;
  archetypeStat: string;
  archetypePercentile: number;

  // Card 9: Share
  globalRank: number;
  totalDevelopers: number;
  shareCount: number;
}
