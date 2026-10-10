import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ResearchPage } from './research';

/** Card actions: how other products organise feed-card actions. */
const meta: Meta = {
  title: 'Experiments/Card actions/3. Research',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const Research: StoryObj = {
  name: 'Products, gutters and rules',
  render: () => <ResearchPage />,
};
