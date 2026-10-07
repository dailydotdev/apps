import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveSheet } from '../kit';
import { titles } from '../titles';

const meta: Meta = {
  title: 'Verified Squads (parked)/2. Audience insights/Responsive',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** The Audience section at phone, tablet and desktop width. */
export const AllWidths: StoryObj = {
  name: 'All widths',
  render: () => (
    <ResponsiveSheet
      heading="Audience insights at every width"
      screens={[
        {
          label: 'The section',
          title: titles.audienceManage,
          story: 'Section',
          note: 'Tiles go 2 across from tablet; the three breakdowns sit side by side from laptop.',
        },
        {
          label: 'Five rows, long names',
          title: titles.audienceManage,
          story: 'FiveRowsLongNames',
        },
        {
          label: 'Small squad',
          title: titles.audienceManage,
          story: 'SmallSquad',
        },
      ]}
    />
  ),
};
