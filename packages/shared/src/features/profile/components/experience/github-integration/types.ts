/**
 * Mock types for GitHub/GitLab integration
 * These represent the data we would fetch from GitHub/GitLab APIs
 */

export interface RepositoryLanguage {
  name: string;
  percentage: number;
  color: string;
}

export interface ActivityData {
  date: string;
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
}

export interface Repository {
  name: string;
  url: string;
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  languages: RepositoryLanguage[];
  isPrivate?: boolean;
}

export interface AggregatedStats {
  totalCommits: number;
  totalPullRequests: number;
  totalReviews: number;
  totalIssues: number;
  languages: RepositoryLanguage[];
  activityHistory: ActivityData[];
  contributionStreak: number;
  lastActivityDate: string;
}

export interface GitIntegrationData {
  provider: 'github' | 'gitlab';
  username: string;
  repositories: Repository[];
  aggregatedStats: AggregatedStats;
  connected: boolean;
  lastSynced?: string;
}

// Language colors for common languages
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Other: '#8b8b8b',
};

// Aggregate languages from multiple repos into combined percentages
const aggregateLanguages = (repos: Repository[]): RepositoryLanguage[] => {
  const languageTotals: Record<string, number> = {};
  let totalWeight = 0;

  repos.forEach((repo) => {
    // Weight by repo activity (commits)
    const repoWeight = repo.commits;
    totalWeight += repoWeight;

    repo.languages.forEach((lang) => {
      const contribution = (lang.percentage / 100) * repoWeight;
      languageTotals[lang.name] =
        (languageTotals[lang.name] || 0) + contribution;
    });
  });

  // Convert to percentages and sort
  const languages = Object.entries(languageTotals)
    .map(([name, weight]) => ({
      name,
      percentage: totalWeight > 0 ? (weight / totalWeight) * 100 : 0,
      color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Keep top 5, group rest as "Other"
  if (languages.length > 5) {
    const top5 = languages.slice(0, 5);
    const otherPercentage = languages
      .slice(5)
      .reduce((sum, l) => sum + l.percentage, 0);

    if (otherPercentage > 0) {
      const existingOther = top5.find((l) => l.name === 'Other');
      if (existingOther) {
        existingOther.percentage += otherPercentage;
      } else {
        top5.push({
          name: 'Other',
          percentage: otherPercentage,
          color: LANGUAGE_COLORS.Other,
        });
      }
    }
    return top5;
  }

  return languages;
};

// Generate mock activity history
const generateActivityHistory = (): ActivityData[] => {
  const activityHistory: ActivityData[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    activityHistory.push({
      date: date.toISOString().split('T')[0],
      commits: Math.floor(Math.random() * 45) + 10,
      pullRequests: Math.floor(Math.random() * 15) + 2,
      reviews: Math.floor(Math.random() * 20) + 5,
      issues: Math.floor(Math.random() * 8) + 1,
    });
  }

  return activityHistory;
};

// Mock data generator for demo purposes - now with multiple repos
export const generateMockGitStats = (
  provider: 'github' | 'gitlab' = 'github',
): GitIntegrationData => {
  // Simulate multiple repositories for a company
  const repositories: Repository[] = [
    {
      name: 'webapp',
      url: `https://${provider}.com/acme/webapp`,
      commits: 847,
      pullRequests: 56,
      reviews: 89,
      issues: 23,
      languages: [
        { name: 'TypeScript', percentage: 65, color: '#3178c6' },
        { name: 'CSS', percentage: 20, color: '#563d7c' },
        { name: 'JavaScript', percentage: 10, color: '#f7df1e' },
        { name: 'HTML', percentage: 5, color: '#e34c26' },
      ],
    },
    {
      name: 'api-gateway',
      url: `https://${provider}.com/acme/api-gateway`,
      commits: 423,
      pullRequests: 34,
      reviews: 67,
      issues: 12,
      languages: [
        { name: 'Go', percentage: 85, color: '#00ADD8' },
        { name: 'Dockerfile', percentage: 10, color: '#384d54' },
        { name: 'Shell', percentage: 5, color: '#89e051' },
      ],
    },
    {
      name: 'shared-components',
      url: `https://${provider}.com/acme/shared-components`,
      commits: 312,
      pullRequests: 28,
      reviews: 45,
      issues: 8,
      languages: [
        { name: 'TypeScript', percentage: 80, color: '#3178c6' },
        { name: 'CSS', percentage: 15, color: '#563d7c' },
        { name: 'JavaScript', percentage: 5, color: '#f7df1e' },
      ],
    },
    {
      name: 'ml-pipeline',
      url: `https://${provider}.com/acme/ml-pipeline`,
      commits: 189,
      pullRequests: 15,
      reviews: 22,
      issues: 6,
      languages: [
        { name: 'Python', percentage: 90, color: '#3572A5' },
        { name: 'Shell', percentage: 7, color: '#89e051' },
        { name: 'Dockerfile', percentage: 3, color: '#384d54' },
      ],
    },
    {
      name: 'infrastructure',
      url: `https://${provider}.com/acme/infrastructure`,
      commits: 156,
      pullRequests: 12,
      reviews: 18,
      issues: 4,
      isPrivate: true,
      languages: [
        { name: 'Shell', percentage: 45, color: '#89e051' },
        { name: 'Python', percentage: 35, color: '#3572A5' },
        { name: 'Dockerfile', percentage: 20, color: '#384d54' },
      ],
    },
  ];

  // Aggregate stats across all repos
  const totalCommits = repositories.reduce((sum, r) => sum + r.commits, 0);
  const totalPullRequests = repositories.reduce(
    (sum, r) => sum + r.pullRequests,
    0,
  );
  const totalReviews = repositories.reduce((sum, r) => sum + r.reviews, 0);
  const totalIssues = repositories.reduce((sum, r) => sum + r.issues, 0);

  return {
    provider,
    username: 'johndoe',
    repositories,
    connected: true,
    lastSynced: new Date().toISOString(),
    aggregatedStats: {
      totalCommits,
      totalPullRequests,
      totalReviews,
      totalIssues,
      languages: aggregateLanguages(repositories),
      activityHistory: generateActivityHistory(),
      contributionStreak: 23,
      lastActivityDate: new Date().toISOString(),
    },
  };
};
