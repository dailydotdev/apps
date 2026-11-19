import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import type { PreviewArgs } from './storyHarness';
import { baseMeta, TagStep, todayStory, variantStory } from './storyHarness';
import { PhoneFrames } from './PhoneFrames';
import { FeedPreviewOverview } from './FeedPreviewOverview';
import type { ProgressPlacement } from './ShortList';
import { ShortList } from './ShortList';
import { MostDiscussed } from './MostDiscussed';
import { BuildMoment } from './BuildMoment';

const meta: Meta<PreviewArgs> = {
  ...baseMeta,
  title: 'Components/Onboarding/Feed preview/Explorations',
};

export default meta;

type Story = StoryObj<PreviewArgs>;

export const StartHere: Story = {
  name: 'Start here',
  parameters: { controls: { disable: true } },
  render: () => <FeedPreviewOverview />,
};

export const Today: Story = todayStory;

export const A: StoryObj<
  PreviewArgs & { progressPlacement: ProgressPlacement }
> = {
  name: 'A · Short list + progress',
  argTypes: {
    progressPlacement: {
      control: {
        type: 'inline-radio',
        labels: { top: 'Above the tags', docked: 'Docked above Continue' },
      },
      options: ['top', 'docked'],
    },
  },
  args: { startingTags: 'three', progressPlacement: 'top' },
  render: ({ startingTags, initialOpen, progressPlacement }) => (
    <TagStep startingTags={startingTags}>
      <ShortList
        initialOpen={initialOpen}
        onContinue={fn()}
        progressPlacement={progressPlacement}
      />
    </TagStep>
  ),
};

export const F: Story = variantStory('F · Example discussions', MostDiscussed);
export const O: Story = variantStory('O · Build moment', BuildMoment);

export const OnAPhone: Story = {
  name: 'All three on a phone',
  parameters: { controls: { disable: true } },
  render: () => (
    <PhoneFrames
      description="390px, preview open. A starts at three tags so its progress shows, the rest at five. O opens on its build moment. Each frame scrolls."
      frames={[
        { id: 'today', label: 'Today (production)' },
        { id: 'a', label: 'A · Short list + progress' },
        { id: 'f', label: 'F · Example discussions' },
        { id: 'o', label: 'O · Build moment' },
      ]}
      storyPrefix="components-onboarding-feed-preview-explorations"
      title="All three on a phone"
    />
  ),
};
