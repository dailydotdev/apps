import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widgets/Reading list',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const ReadingList: StoryObj = {
  name: 'Reading list',
  render: () => (
    <WidgetPage title="Reading list" kinds={[{ kind: 'bookmarks' }]} />
  ),
};
