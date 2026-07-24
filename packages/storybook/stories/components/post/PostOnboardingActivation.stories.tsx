import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostOnboardingActivationView } from '@dailydotdev/shared/src/components/post/PostOnboardingActivationView';

const meta: Meta<typeof PostOnboardingActivationView> = {
  title: 'Components/Post/PostOnboardingActivation',
  component: PostOnboardingActivationView,
  args: {
    title: "Your feed isn't set up yet",
    description: "You're one step away from discovering what's next.",
    ctaLabel: 'Finish setup',
    progress: 1,
    steps: 2,
  },
  argTypes: {
    progress: { control: { type: 'number', min: 0, max: 5, step: 1 } },
    steps: { control: { type: 'number', min: 1, max: 5, step: 1 } },
    onCtaClick: { action: 'cta clicked' },
    className: { table: { disable: true } },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-64 bg-background-default">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PostOnboardingActivationView>;

/**
 * Interactive playground — tweak the copy, CTA label and progress ring via
 * the Controls panel. The panel is intentionally always dark, so it looks the
 * same under the light/dark theme toolbar toggle.
 */
export const Playground: Story = {};

/** The default configuration mounted app-wide by the activation container. */
export const Default: Story = {};

/** Different progress fractions to sanity-check the ring + label. */
export const ProgressVariations: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <PostOnboardingActivationView {...args} progress={1} steps={2} />
      <PostOnboardingActivationView {...args} progress={1} steps={3} />
      <PostOnboardingActivationView {...args} progress={2} steps={3} />
      <PostOnboardingActivationView
        {...args}
        progress={2}
        steps={2}
        title="You're all set"
        description="Your feed is ready — jump back in."
        ctaLabel="Open my feed"
      />
    </div>
  ),
};

/** Copy-length stress test to check wrapping and alignment. */
export const CopyVariations: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <PostOnboardingActivationView
        {...args}
        title="Almost there"
        description="Pick a few topics to finish."
        ctaLabel="Continue"
      />
      <PostOnboardingActivationView
        {...args}
        title="Your feed isn't set up yet — let's fix that in under a minute"
        description="You're one step away from a feed tuned to the topics, tools and communities you actually care about."
        ctaLabel="Finish setup"
      />
    </div>
  ),
};

/** Narrow viewport — the layout stacks and the CTA sits under the copy. */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
