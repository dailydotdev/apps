import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ComparePage } from './review';

const meta: Meta = {
  title: 'Cookie banner & Signup strip/1. Compare',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const SideBySide: StoryObj = {
  name: 'Production and variants',
  render: () => <ComparePage />,
};
