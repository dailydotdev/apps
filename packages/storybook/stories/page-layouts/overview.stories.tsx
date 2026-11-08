import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OverviewPage } from './kit';
import { families } from './categories';

const meta: Meta = {
  title: 'Page layouts/Overview',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const Overview: StoryObj = {
  render: () => <OverviewPage families={families} />,
};
