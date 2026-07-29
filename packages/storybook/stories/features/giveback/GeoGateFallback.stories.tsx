import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GeoGateFallback } from '@dailydotdev/shared/src/features/giveback/components/GeoGateFallback';

// Full-page gate shown when Giveback isn't live in the visitor's region
// (driven by `status.enabled === false` on the real GivebackPage).
const meta: Meta<typeof GeoGateFallback> = {
  title: 'Features/Giveback/Geo gate',
  component: GeoGateFallback,
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
type Story = StoryObj<typeof GeoGateFallback>;

export const Default: Story = {};
