import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ReadMePage } from './review';

const meta: Meta = {
  title: 'Cookie banner & Signup strip/0. Read me',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Problem: StoryObj = {
  name: 'Problem and test',
  render: () => <ReadMePage />,
};
