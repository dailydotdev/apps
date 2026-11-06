import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inventory } from './inventory';

const meta: Meta = {
  title: 'Login Surfaces/Web/Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <Inventory platform="web" />,
};
