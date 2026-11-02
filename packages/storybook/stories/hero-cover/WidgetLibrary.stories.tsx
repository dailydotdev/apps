import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Page } from './parts';
import { WidgetLibrary as Library } from './widgets/library';

const meta: Meta = {
  title: 'Hero Cover/Final/4. Widget library',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const WidgetLibrary: StoryObj = {
  name: '4. Widget library',
  render: () => (
    <Page
      chapter="Final · 4"
      question="What does every widget look like?"
      title="Every widget, every size"
      goal="One place to review each widget we agreed on, plus the open ideas, at true scale in every size it comes in, and to see it in edit mode or flipping in a stack."
      metric="Nothing to measure: sign-off on each widget before it is designed in detail."
    >
      <Library />
    </Page>
  ),
};
