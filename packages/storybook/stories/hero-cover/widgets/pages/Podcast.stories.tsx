import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Podcast',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Podcast: StoryObj = {
  name: 'Podcast',
  render: () => <WidgetPage title="Podcast" kinds={[{ kind: 'podcast' }]} />,
};
