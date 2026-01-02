/**
 * Types for multi-source activity heatmap
 * Aggregates contributions from various platforms
 */

export type ActivitySource =
  | 'github'
  | 'gitlab'
  | 'dailydev'
  | 'stackoverflow'
  | 'linkedin'
  | 'devto';

export interface SourceConfig {
  id: ActivitySource;
  label: string;
  color: string;
  icon: string;
  enabled: boolean;
}

export interface DayActivity {
  date: string;
  sources: Partial<Record<ActivitySource, number>>;
  total: number;
}

export interface ActivityBreakdown {
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  posts: number;
  comments: number;
  reads: number;
  upvotes: number;
  answers: number;
}

export interface DayActivityDetailed extends DayActivity {
  breakdown?: Partial<ActivityBreakdown>;
}

export const SOURCE_CONFIGS: Record<
  ActivitySource,
  Omit<SourceConfig, 'enabled'>
> = {
  github: {
    id: 'github',
    label: 'GitHub',
    color: '#238636',
    icon: 'GitHub',
  },
  gitlab: {
    id: 'gitlab',
    label: 'GitLab',
    color: '#fc6d26',
    icon: 'GitLab',
  },
  dailydev: {
    id: 'dailydev',
    label: 'daily.dev',
    color: '#ce3df3',
    icon: 'Daily',
  },
  stackoverflow: {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    color: '#f48024',
    icon: 'StackOverflow',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0a66c2',
    icon: 'LinkedIn',
  },
  devto: {
    id: 'devto',
    label: 'DEV.to',
    color: '#3b49df',
    icon: 'DevTo',
  },
};

// Generate mock activity data
export const generateMockMultiSourceActivity = (
  startDate: Date,
  endDate: Date,
): DayActivityDetailed[] => {
  const activities: DayActivityDetailed[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Simulate realistic activity patterns
    const baseActivity = isWeekend ? 0.3 : 1;
    const randomFactor = Math.random();

    // Some days have no activity
    if (randomFactor < 0.15) {
      activities.push({
        date: dateStr,
        sources: {},
        total: 0,
      });
    } else {
      const sources: Partial<Record<ActivitySource, number>> = {};
      let total = 0;

      // GitHub - most active
      if (randomFactor > 0.2) {
        const github = Math.floor(Math.random() * 15 * baseActivity) + 1;
        sources.github = github;
        total += github;
      }

      // daily.dev - reading activity
      if (randomFactor > 0.1) {
        const dailydev = Math.floor(Math.random() * 8 * baseActivity) + 1;
        sources.dailydev = dailydev;
        total += dailydev;
      }

      // GitLab - occasional
      if (randomFactor > 0.6) {
        const gitlab = Math.floor(Math.random() * 6 * baseActivity) + 1;
        sources.gitlab = gitlab;
        total += gitlab;
      }

      // Stack Overflow - rare but valuable
      if (randomFactor > 0.85) {
        const stackoverflow = Math.floor(Math.random() * 3) + 1;
        sources.stackoverflow = stackoverflow;
        total += stackoverflow;
      }

      // DEV.to - occasional posts/comments
      if (randomFactor > 0.9) {
        const devto = Math.floor(Math.random() * 2) + 1;
        sources.devto = devto;
        total += devto;
      }

      activities.push({
        date: dateStr,
        sources,
        total,
        breakdown: {
          commits: sources.github ? Math.floor(sources.github * 0.6) : 0,
          pullRequests: sources.github ? Math.floor(sources.github * 0.2) : 0,
          reviews: sources.github ? Math.floor(sources.github * 0.2) : 0,
          posts: (sources.dailydev || 0) + (sources.devto || 0),
          reads: sources.dailydev ? sources.dailydev * 3 : 0,
          comments: Math.floor(total * 0.1),
          upvotes: Math.floor(total * 0.15),
          answers: sources.stackoverflow || 0,
        },
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return activities;
};
