import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, HeroCover, Page, Stage } from './parts';

const meta: Meta = {
  title: 'Hero Cover/Archive/First cover/1. Composition',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Composition: StoryObj = {
  name: '1. Composition',
  render: () => (
    <Page
      chapter="1"
      question="How many promo bars fit next to the headlines?"
      title="Three bars or four"
      goal="Find the count where every bar is still readable and the strip does not outshout the featured card."
      metric="Strip click-through per bar, so a fourth bar has to earn its place against the other three."
    >
      <Case
        title="Three bars"
        note="Briefing, podcast and a promoted squad. Each bar is tall enough for a two-line title."
      >
        <Stage columns={5}>
          <HeroCover promoCount={3} />
        </Stage>
      </Case>
      <Case
        title="Four bars"
        note="Adds the Agents Arena matchup. Titles still fit, but the bars start to read as a list rather than as doors."
      >
        <Stage columns={5}>
          <HeroCover promoCount={4} />
        </Stage>
      </Case>
    </Page>
  ),
};
