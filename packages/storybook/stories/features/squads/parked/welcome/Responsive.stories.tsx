import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveSheet } from '../kit';
import { titles } from '../titles';

const meta: Meta = {
  title: 'Verified Squads (parked)/1. Welcome pop-up/Responsive',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** Every welcome screen at phone, tablet and desktop width. */
export const AllWidths: StoryObj = {
  name: 'All widths',
  render: () => (
    <ResponsiveSheet
      heading="Welcome pop-up at every width"
      screens={[
        {
          label: 'In the app',
          title: titles.welcomePopup,
          story: 'InTheApp',
          note: 'A small centred modal from tablet up, a bottom drawer on the phone.',
        },
        {
          label: 'The pop-up, longest copy',
          title: titles.welcomePopup,
          story: 'LongestCopy',
        },
        {
          label: 'Manage › Welcome pop-up',
          title: titles.welcomeManage,
          story: 'Filled',
          note: 'Form and preview side by side from laptop L (1360px), stacked below.',
        },
      ]}
    />
  ),
};
