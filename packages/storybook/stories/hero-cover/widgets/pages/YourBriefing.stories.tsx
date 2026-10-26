import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Your briefing',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const YourBriefing: StoryObj = {
  name: 'Your briefing',
  render: () => (
    <WidgetPage title="Your briefing" kinds={[{ kind: 'mybrief' }]} />
  ),
};
