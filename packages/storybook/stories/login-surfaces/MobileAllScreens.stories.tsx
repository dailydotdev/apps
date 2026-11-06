import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlignedScreens } from './allScreens';

const meta: Meta = {
  title: 'Login Surfaces/Mobile/All screens',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const AllScreens: StoryObj = {
  name: 'All screens',
  render: () => <AlignedScreens platform="mobile" />,
};
