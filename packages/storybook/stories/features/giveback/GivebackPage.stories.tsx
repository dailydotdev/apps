import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackPage } from '@dailydotdev/shared/src/features/giveback/components/GivebackPage';

const meta: Meta<typeof GivebackPage> = {
  title: 'Features/Giveback/GivebackPage',
  component: GivebackPage,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-background-default text-text-primary">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GivebackPage>;

export const Default: Story = {};
