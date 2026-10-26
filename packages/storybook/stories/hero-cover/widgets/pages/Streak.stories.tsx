import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Streak',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Streak: StoryObj = {
  name: 'Streak',
  render: () => <WidgetPage title="Streak" kinds={[{ kind: 'streak' }]} />,
};
