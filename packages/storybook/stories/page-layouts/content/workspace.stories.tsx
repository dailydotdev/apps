import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryPage } from '../kit';
import { contentWorkspace } from '../categories';

const meta: Meta = {
  title: 'Page layouts/Content/Full-height workspace',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const AllPages: StoryObj = {
  name: 'All pages',
  render: () => <CategoryPage category={contentWorkspace} />,
};
