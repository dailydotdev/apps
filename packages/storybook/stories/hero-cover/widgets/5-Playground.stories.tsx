import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Page } from '../parts';
import { Playground as PlaygroundView } from './playground';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget exploration/5. Playground',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Playground: StoryObj = {
  name: '5. Playground',
  render: () => (
    <Page
      chapter="Widgets · 5"
      question="How does it feel to use?"
      title="Build your own hero"
      goal="Try the mechanics together: add from the gallery, drag to reorder, tap the size badge to resize, the minus to remove, and switch how overflow and the ad behave."
      metric="Nothing to measure: a place to feel the trade-offs before choosing."
    >
      <PlaygroundView />
    </Page>
  ),
};
