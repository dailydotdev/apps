import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Topical digest',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const TopicalDigest: StoryObj = {
  name: 'Topical digest',
  render: () => (
    <WidgetPage title="Topical digest" kinds={[{ kind: 'digest' }]} />
  ),
};
