import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import ExtensionProviders from '../../extension/_providers';
import realFeed from './realFeed.json';
import type { LabArgs } from './pages';
import { ConceptInFeed, ConceptsGallery, FeedGap, Lab } from './pages';
import { ALL_CONCEPTS } from './concepts';
import { DEVICES } from './frames';

/** Card actions, the deeper views: live breakpoints, card types and a lab. */
const meta: Meta = {
  title: 'Experiments/Card actions/2. Explore',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const FeedGapStory: Story = {
  name: 'Feed gap — before / after',
  render: () => <FeedGap />,
};
export const CardTypes: Story = {
  name: 'Variants on every card type',
  render: () => <ConceptsGallery />,
};
export const InFeed: Story = {
  name: 'A variant in the feed',
  render: () => <ConceptInFeed />,
};
export const LabStory: StoryObj<LabArgs> = {
  name: 'Lab',
  args: {
    concept: 'today-32',
    gap: 20,
    side: 40,
    sidebar: 'open',
    device: 'Narrowest grid',
    seed: 0,
  },
  argTypes: {
    concept: { control: 'select', options: ALL_CONCEPTS.map((c) => c.id) },
    gap: { control: { type: 'range', min: 0, max: 40, step: 4 } },
    side: { control: { type: 'range', min: 0, max: 40, step: 4 } },
    sidebar: { control: 'inline-radio', options: ['open', 'closed'] },
    device: { control: 'select', options: DEVICES.map((d) => d.name) },
    seed: {
      control: { type: 'range', min: 0, max: realFeed.posts.length - 1 },
    },
  },
  render: (args) => <Lab {...(args as LabArgs)} />,
};
