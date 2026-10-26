import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Squad updates',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const SquadUpdates: StoryObj = {
  name: 'Squad updates',
  render: () => (
    <WidgetPage title="Squad updates" kinds={[{ kind: 'squads' }]} />
  ),
};
