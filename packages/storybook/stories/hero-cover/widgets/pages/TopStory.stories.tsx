import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Top story',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const TopStory: StoryObj = {
  name: 'Top story',
  render: () => <WidgetPage title="Top story" kinds={[{ kind: 'featured' }]} />,
};
