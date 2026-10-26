import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Notifications',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Notifications: StoryObj = {
  name: 'Notifications',
  render: () => (
    <WidgetPage title="Notifications" kinds={[{ kind: 'notifications' }]} />
  ),
};
