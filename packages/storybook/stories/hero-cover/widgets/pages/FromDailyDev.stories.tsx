import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/From daily.dev',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const FromDailyDev: StoryObj = {
  name: 'From daily.dev',
  render: () => (
    <WidgetPage
      title="From daily.dev"
      kinds={[
        {
          kind: 'promo',
          label: 'One campaign leads',
          note: 'The lead campaign with its one action; on Tall the others follow as rows.',
        },
        {
          kind: 'whatsnew',
          label: 'Two campaigns',
          note: 'Two of our campaigns as rows on Small; Tall leads with one.',
        },
      ]}
    />
  ),
};
