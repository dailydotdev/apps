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
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    emoji: '🦉',
    name: 'Night Owl',
    description: 'While others sleep, you level up.',
    color: '#4d9dff',
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    emoji: '📚',
    name: 'Scholar',
    description: "You don't skim. You study.",
    color: '#f7c948',
  },
  PULSE_READER: {
    id: 'PULSE_READER',
    emoji: '⚡',
    name: 'Pulse Reader',
    description: 'First to know. Always.',
    color: '#00d4ff',
  },
  OPINIONIST: {
    id: 'OPINIONIST',
    emoji: '🎤',
    name: 'Opinionist',
    description: 'Hot takes need witnesses.',
    color: '#e637bf',
  },
  COLLECTOR: {
    id: 'COLLECTOR',
    emoji: '🗃️',
    name: 'Collector',
    description: 'Bookmarks: ∞. Read later: TBD.',
    color: '#a855f7',
  },
  STREAK_WARRIOR: {
    id: 'STREAK_WARRIOR',
    emoji: '🔥',
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
  logoUrl?: string;
}

export interface ReadingRecord {
  type:
    | 'streak'
    | 'binge'
    | 'lateNight'
    | 'earlyMorning'
    | 'consistency'
    | 'marathon';
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
    { name: 'dev.to', postsRead: 127 },
    { name: 'Hacker News', postsRead: 98 },
    { name: 'Pragmatic Engineer', postsRead: 64 },
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
      type: 'streak',
      label: 'Longest Streak',
      value: '47 days',
      percentile: 6,
    },
    {
      type: 'binge',
      label: 'Biggest Binge',
      value: '34 posts on Mar 12',
      percentile: 3,
    },
    {
      type: 'lateNight',
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
