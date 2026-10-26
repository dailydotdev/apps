import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Messages',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Messages: StoryObj = {
  name: 'Messages',
  render: () => <WidgetPage title="Messages" kinds={[{ kind: 'dms' }]} />,
};
