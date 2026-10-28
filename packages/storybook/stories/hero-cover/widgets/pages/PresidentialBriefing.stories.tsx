import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Presidential briefing',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const PresidentialBriefing: StoryObj = {
  name: 'Presidential briefing',
  render: () => (
    <WidgetPage
      title="Presidential briefing"
      kinds={[
        {
          kind: 'briefing',
          label: 'As a card',
          note: 'The briefing card production shows today, at every size.',
        },
        {
          kind: 'brieftext',
          label: 'Read inside',
          note: 'The brief itself, read in the widget without opening it.',
        },
      ]}
    />
  ),
};
