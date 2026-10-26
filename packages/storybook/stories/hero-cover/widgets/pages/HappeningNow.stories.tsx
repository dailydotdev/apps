import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Happening now',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const HappeningNow: StoryObj = {
  name: 'Happening now',
  render: () => (
    <WidgetPage title="Happening now" kinds={[{ kind: 'happening' }]} />
  ),
};
