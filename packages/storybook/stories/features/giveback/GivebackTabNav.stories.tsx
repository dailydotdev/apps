import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackTabNav } from '@dailydotdev/shared/src/features/giveback/components/GivebackTabNav';
import type { GivebackTabId } from '@dailydotdev/shared/src/features/giveback/components/GivebackTabNav';
import { withGiveback } from './giveback.mocks';

// The sticky tab navigation that switches between Take action / Rewards /
// Campaign. Prop-driven (activeTab + onSelect); this story keeps the active tab
// in local state so the tabs are clickable.
const meta: Meta<typeof GivebackTabNav> = {
  title: 'Features/Giveback/Tab nav',
  component: GivebackTabNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Click between the three campaign tabs to see the active state.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackTabNav>;

export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<GivebackTabId>('actions');
    return <GivebackTabNav activeTab={activeTab} onSelect={setActiveTab} />;
  },
};
