import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  GitIntegrationStats,
  LanguageBar,
  ActivityChart,
  ExperienceWithGitStats,
  generateMockGitStats,
} from '@dailydotdev/shared/src/features/profile/components/experience/github-integration';

const meta: Meta = {
  title: 'Features/Profile/GitIntegration',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

/**
 * Full GitHub integration stats in a collapsible section.
 * This is the main component to use for displaying GitHub/GitLab activity.
 */
export const GitHubStats: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('github');
    return <GitIntegrationStats data={mockData} initiallyOpen />;
  },
};

/**
 * GitLab variant of the integration stats.
 */
export const GitLabStats: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('gitlab');
    return <GitIntegrationStats data={mockData} initiallyOpen />;
  },
};

/**
 * Collapsed state - shows preview stats.
 * Click to expand and see full details.
 */
export const Collapsed: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('github');
    return <GitIntegrationStats data={mockData} initiallyOpen={false} />;
  },
};

/**
 * Language percentage bar standalone component.
 * Shows programming language distribution like on GitHub.
 */
export const LanguageBarOnly: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('github');
    return <LanguageBar languages={mockData.stats.languages} />;
  },
};

/**
 * Language bar without legend - more compact view.
 */
export const LanguageBarCompact: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('github');
    return <LanguageBar languages={mockData.stats.languages} showLegend={false} />;
  },
};

/**
 * Activity chart standalone component.
 * Shows commits, PRs, reviews, and issues over time.
 */
export const ActivityChartOnly: StoryObj = {
  render: () => {
    const mockData = generateMockGitStats('github');
    return <ActivityChart data={mockData.stats.activityHistory} />;
  },
};

/**
 * Full experience card with GitHub integration.
 * This demonstrates how the GitIntegrationStats component
 * would look when integrated into an actual experience item.
 */
export const ExperienceWithGitHub: StoryObj = {
  render: () => <ExperienceWithGitStats provider="github" />,
};

/**
 * Full experience card with GitLab integration.
 */
export const ExperienceWithGitLab: StoryObj = {
  render: () => <ExperienceWithGitStats provider="gitlab" />,
};

/**
 * Multiple experiences stacked.
 * Shows how multiple experiences with different integrations would look.
 */
export const MultipleExperiences: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ExperienceWithGitStats provider="github" />
      <ExperienceWithGitStats provider="gitlab" />
    </div>
  ),
};
