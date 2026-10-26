import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Agent updates',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const AgentUpdates: StoryObj = {
  name: 'Agent updates',
  render: () => (
    <WidgetPage title="Agent updates" kinds={[{ kind: 'agents' }]} />
  ),
};
