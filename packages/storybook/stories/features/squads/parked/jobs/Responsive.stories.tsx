import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveSheet } from '../kit';
import { titles } from '../titles';

const meta: Meta = {
  title: 'Verified Squads (parked)/3. Jobs/Responsive',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** Every jobs screen at phone, tablet and desktop width. */
export const AllWidths: StoryObj = {
  name: 'All widths',
  render: () => (
    <ResponsiveSheet
      heading="Jobs at every width"
      screens={[
        {
          label: 'Jobs tab',
          title: titles.jobsTab,
          story: 'Board',
          note: 'Tabs over the feed from laptop; below it they join Posts and About, and the right column moves behind About.',
        },
        { label: 'Role page', title: titles.jobsRole, story: 'Full' },
        { label: 'Manage › Jobs', title: titles.jobsManage, story: 'Roles' },
        { label: 'Edit role', title: titles.jobsManage, story: 'EditRole' },
      ]}
    />
  ),
};
