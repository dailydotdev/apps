import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryPage } from '../kit';
import { contentNarrowColumn } from '../categories';

const meta: Meta = {
  title: 'Page layouts/Content/Narrow column',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const AllPages: StoryObj = {
  name: 'All pages',
  render: () => <CategoryPage category={contentNarrowColumn} />,
};
