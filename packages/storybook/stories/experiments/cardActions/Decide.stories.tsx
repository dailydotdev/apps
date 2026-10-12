import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import ExtensionProviders from '../../extension/_providers';
import { Overview } from './pages';
import { ComparePage } from './compare';
import { FitPage } from './fit';
import { GapSheet } from './gapSheet';

/**
 * Card actions, the pages for making the call: the shortlist side by side,
 * whether each variant fits, and today's bar at 32px gap by gap.
 */
const meta: Meta = {
  title: 'Experiments/Card actions/1. Decide',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const OverviewStory: Story = {
  name: 'Overview',
  render: () => <Overview />,
};
export const Compare: Story = { render: () => <ComparePage /> };
export const FitCheck: Story = {
  name: 'Fit check',
  render: () => <FitPage />,
};
export const GapSheetStory: Story = {
  name: 'Gap sheet — today’s bar',
  render: () => <GapSheet />,
};
