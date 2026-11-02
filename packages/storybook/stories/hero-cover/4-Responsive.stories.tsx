import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, HeroCover, Page, Stage } from './parts';

const meta: Meta = {
  title: 'Hero Cover/Archive/First cover/4. Responsive',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Responsive: StoryObj = {
  name: '4. Responsive',
  render: () => (
    <Page
      chapter="4"
      question="What gives way when the feed narrows?"
      title="Drop the agents, then move the strip"
      goal="Keep the featured card at two columns and the ad beside it on every laptop, and lose the least valuable column first."
      metric="Hero click-through by column count, so a narrow feed is not quietly losing the strip."
    >
      <Case
        title="5 columns"
        note="Everything fits: featured, ad, agent updates, strip."
      >
        <Stage columns={5}>
          <HeroCover columns={5} />
        </Stage>
      </Case>
      <Case
        title="4 columns"
        note="Agent updates go first. The ad and the strip keep their columns."
      >
        <Stage columns={4}>
          <HeroCover columns={4} />
        </Stage>
      </Case>
      <Case
        title="3 columns"
        note="The strip turns sideways and runs under the row, so the featured card keeps its two columns."
      >
        <Stage columns={3}>
          <HeroCover columns={3} />
        </Stage>
      </Case>
    </Page>
  ),
};
