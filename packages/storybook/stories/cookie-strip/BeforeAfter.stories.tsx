import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BeforeAfterPage } from './review';

/** Production next to one variant at every size, phones and tablets included. */
const meta: Meta = {
  title: 'Cookie banner & Signup strip/2. Before and after',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const ColumnLayout: Story = {
  name: 'Column layout',
  render: () => <BeforeAfterPage id="column" />,
};

export const Handoff: Story = {
  name: 'Handoff dock',
  render: () => <BeforeAfterPage id="handoff" />,
};

export const EverySource: Story = {
  name: 'Every source',
  render: () => <BeforeAfterPage id="sources" />,
};
