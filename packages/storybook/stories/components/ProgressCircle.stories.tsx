import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';

const meta: Meta<typeof ProgressCircle> = {
  title: 'Components/ProgressCircle',
  component: ProgressCircle,
  tags: ['autodocs'],
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress percentage (0-100)',
    },
    size: {
      control: { type: 'number', min: 20, max: 200, step: 10 },
      description: 'Size of the circle in pixels',
    },
    stroke: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: 'Stroke width of the circle',
    },
    color: {
      control: 'color',
      description: 'Color of the progress arc',
    },
    showPercentage: {
      control: 'boolean',
      description: 'Whether to show the percentage text in the center',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressCircle>;

export const Default: Story = {
  args: {
    progress: 50,
  },
};

export const ProgressStages: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((progress) => (
        <div key={progress} className="flex flex-col items-center gap-2">
          <ProgressCircle progress={progress} />
          <span className="text-text-tertiary typo-caption1">{progress}%</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the progress circle at different completion stages.',
      },
    },
  },
};

export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-12">
      {[
        { label: 'Profile', progress: 45 },
        { label: 'Settings', progress: 80 },
        { label: 'Verification', progress: 100 },
        { label: 'Onboarding', progress: 25 },
      ].map(({ label, progress }) => (
        <div key={label} className="flex items-center gap-3">
          <ProgressCircle progress={progress} />
          <div className="flex flex-col">
            <span className="typo-callout font-bold text-text-primary">
              {label}
            </span>
            <span className="text-text-tertiary typo-caption1">
              {progress}% complete
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example usage with labels and descriptions.',
      },
    },
  },
};

export const WithPercentage: Story = {
  args: {
    progress: 65,
    showPercentage: true,
  },
};

export const PercentageVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      {[5, 25, 50, 75, 95].map((progress) => (
        <div key={progress} className="flex flex-col items-center gap-2">
          <ProgressCircle progress={progress} showPercentage size={56} />
          <span className="text-text-tertiary typo-caption1">
            {progress}% progress
          </span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress circles with percentage text at different stages.',
      },
    },
  },
};

