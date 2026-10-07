import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveSheet } from '../kit';
import { titles } from '../titles';

const meta: Meta = {
  title: 'Verified Squads (parked)/4. Member perks/Responsive',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** Every perks screen at phone, tablet and desktop width. */
export const AllWidths: StoryObj = {
  name: 'All widths',
  render: () => (
    <ResponsiveSheet
      heading="Member perks at every width"
      screens={[
        {
          label: 'Perks tab, member',
          title: titles.perksTab,
          story: 'Member',
          note: 'Cards 1 across on phone, 2 from tablet.',
        },
        {
          label: 'Perk page, member',
          title: titles.perksPage,
          story: 'SharedCode',
        },
        {
          label: 'Perk page, visitor',
          title: titles.perksPage,
          story: 'Visitor',
        },
        {
          label: 'Manage › Member perks',
          title: titles.perksManage,
          story: 'Perks',
        },
        {
          label: 'Edit unique codes',
          title: titles.perksManage,
          story: 'EditUniqueCodes',
        },
      ]}
    />
  ),
};
