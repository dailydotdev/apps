import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';
import { HappeningReadabilityPage } from '../happeningReadability';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Happening now',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const HappeningNow: StoryObj = {
  name: 'Happening now',
  render: () => (
    <WidgetPage title="Happening now" kinds={[{ kind: 'happening' }]} />
  ),
};

export const Readability: StoryObj = {
  name: 'Readability',
  render: () => <HappeningReadabilityPage />,
};
