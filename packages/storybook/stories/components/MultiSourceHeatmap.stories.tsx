import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { subDays } from 'date-fns';
import {
  MultiSourceHeatmap,
  ActivityOverviewCard,
  generateMockMultiSourceActivity,
} from '@dailydotdev/shared/src/components/MultiSourceHeatmap';

const meta: Meta = {
  title: 'Components/MultiSourceHeatmap',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const endDate = new Date();
const startDate = subDays(endDate, 365);
const mockActivities = generateMockMultiSourceActivity(startDate, endDate);

/**
 * The full activity overview card with collapsible heatmap.
 * Aggregates data from GitHub, GitLab, daily.dev, and more.
 */
export const ActivityCard: StoryObj = {
  render: () => <ActivityOverviewCard initiallyOpen />,
};

/**
 * Activity card in collapsed state - shows quick stats preview.
 */
export const ActivityCardCollapsed: StoryObj = {
  render: () => <ActivityOverviewCard initiallyOpen={false} />,
};

/**
 * Standalone heatmap component with all features.
 */
export const HeatmapFull: StoryObj = {
  render: () => (
    <MultiSourceHeatmap
      activities={mockActivities}
      startDate={startDate}
      endDate={endDate}
      showStats
      showLegend
    />
  ),
};

/**
 * Heatmap without stats - just the grid and legend.
 */
export const HeatmapNoStats: StoryObj = {
  render: () => (
    <MultiSourceHeatmap
      activities={mockActivities}
      startDate={startDate}
      endDate={endDate}
      showStats={false}
      showLegend
    />
  ),
};

/**
 * Minimal heatmap - just the grid.
 */
export const HeatmapMinimal: StoryObj = {
  render: () => (
    <MultiSourceHeatmap
      activities={mockActivities}
      startDate={startDate}
      endDate={endDate}
      showStats={false}
      showLegend={false}
    />
  ),
};

/**
 * 6-month view of activity.
 */
export const SixMonthView: StoryObj = {
  render: () => {
    const sixMonthStart = subDays(endDate, 180);
    const sixMonthActivities = generateMockMultiSourceActivity(
      sixMonthStart,
      endDate,
    );
    return (
      <MultiSourceHeatmap
        activities={sixMonthActivities}
        startDate={sixMonthStart}
        endDate={endDate}
        showStats
        showLegend
      />
    );
  },
};

/**
 * 3-month view - compact.
 */
export const ThreeMonthView: StoryObj = {
  render: () => {
    const threeMonthStart = subDays(endDate, 90);
    const threeMonthActivities = generateMockMultiSourceActivity(
      threeMonthStart,
      endDate,
    );
    return (
      <MultiSourceHeatmap
        activities={threeMonthActivities}
        startDate={threeMonthStart}
        endDate={endDate}
        showStats
        showLegend
      />
    );
  },
};
