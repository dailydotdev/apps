import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ImplementationPage } from './review';

const meta: Meta = {
  title: 'Cookie banner & Signup strip/3. Implementation',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Plan: StoryObj = {
  name: 'Plan for the flagged test',
  render: () => <ImplementationPage />,
};
