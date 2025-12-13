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
  name: string;
  description: string;
  color: string;
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'While others sleep, you level up.',
    color: '#4d9dff',
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    name: 'Scholar',
    description: "You don't skim. You study.",
    color: '#f7c948',
  },
  PULSE_READER: {
    id: 'PULSE_READER',
    name: 'Pulse Reader',
    description: 'First to know. Always.',
    color: '#00d4ff',
  },
  OPINIONIST: {
    id: 'OPINIONIST',
    name: 'Opinionist',
    description: 'Hot takes need witnesses.',
    color: '#e637bf',
  },
  COLLECTOR: {
    id: 'COLLECTOR',
    name: 'Collector',
    description: 'Every rabbit hole mapped. Every gem saved.',
    color: '#a855f7',
  },
  STREAK_WARRIOR: {
    id: 'STREAK_WARRIOR',
    name: 'Streak Warrior',
    description: 'Rain or shine. You show up.',
    color: '#ff6b35',
  },
};

export interface TopicMonth {
  month: string;
  topics: [string, string, string]; // Top 3 tags for the month (can have empty strings if fewer than 3)
  comment?: string; // Optional comment to display for this month (e.g., "🔥 THE PIVOT MONTH")
  inactive?: boolean; // True if user had no activity this month
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
  activityHeatmap: number[][]; // 7 days x 24 hours

  // Card 3: Topic Evolution
  topicJourney: TopicMonth[];
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

// Mock data for development
export const MOCK_LOG_DATA: LogData = {
  // Card 1
  totalPosts: 847,
  totalReadingTime: 62,
  daysActive: 234,
  totalImpactPercentile: 91,

  // Card 2
  peakDay: 'Thursday',
  readingPattern: 'night',
  patternPercentile: 8,
  activityHeatmap: Array(7)
    .fill(null)
    .map(() =>
      Array(24)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10)),
    ),

  // Card 3
  topicJourney: [
    { month: 'Jan', topics: ['Python', 'Django', 'REST APIs'] },
    { month: 'Feb', topics: ['Python', 'Machine Learning', 'Pandas'] },
    {
      month: 'Mar',
      topics: ['FastAPI', 'Python', 'PostgreSQL'],
      inactive: true,
    },
    { month: 'Apr', topics: ['FastAPI', 'Docker', 'CI/CD'] },
    { month: 'May', topics: ['Docker', 'Kubernetes', 'DevOps'] },
    { month: 'Jun', topics: ['System Design', 'Microservices', 'AWS'] },
    {
      month: 'Jul',
      topics: ['Kubernetes', 'Helm', 'GitOps'],
      comment: '🔥 THE PIVOT MONTH',
    },
    { month: 'Aug', topics: ['Kubernetes', 'Service Mesh', 'Istio'] },
    { month: 'Sep', topics: ['Go', 'Concurrency', 'gRPC'] },
    { month: 'Oct', topics: ['Rust', 'WebAssembly', 'Performance'] },
    { month: 'Nov', topics: ['Rust', 'Async', 'Tokio'] },
    { month: 'Dec', topics: ['Rust', 'Systems', 'Memory Safety'] },
  ],
  uniqueTopics: 47,
  evolutionPercentile: 23,

  // Card 4
  topSources: [
    {
      name: 'dev.to',
      postsRead: 127,
      logoUrl:
        'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    {
      name: 'Hacker News',
      postsRead: 98,
      logoUrl:
        'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    {
      name: 'Pragmatic Engineer',
      postsRead: 64,
      logoUrl:
        'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1/logos/pragmaticengineer',
    },
  ],
  uniqueSources: 89,
  sourcePercentile: 15,
  sourceLoyaltyName: 'dev.to',

  // Card 5
  upvotesGiven: 234,
  commentsWritten: 18,
  postsBookmarked: 89,
  upvotePercentile: 15,
  commentPercentile: 32,
  bookmarkPercentile: 20,

  // Card 6
  hasContributions: true,
  postsCreated: 12,
  totalViews: 8432,
  commentsReceived: 247,
  upvotesReceived: 892,
  reputationEarned: 1892,
  creatorPercentile: 8,

  // Card 7
  records: [
    {
      type: RecordType.STREAK,
      label: 'Longest Streak',
      value: '47 days',
      percentile: 6,
    },
    {
      type: RecordType.BINGE_DAY,
      label: 'Biggest Binge',
      value: '34 posts on Mar 12',
      percentile: 3,
    },
    {
      type: RecordType.LATE_NIGHT,
      label: 'Latest Night Read',
      value: '3:47 AM',
    },
  ],

  // Card 8
  archetype: 'NIGHT_OWL',
  archetypeStat: 'Only 12% of developers read as late as you',
  archetypePercentile: 12,

  // Card 9
  globalRank: 12847,
  totalDevelopers: 487000,
  shareCount: 24853,
};
