import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import type { PreviewArgs } from './storyHarness';
import { baseMeta, TagStep } from './storyHarness';
import { PhoneFrames } from './PhoneFrames';
import { FinalOverview } from './FinalOverview';
import { FinalTagStep } from './FinalTagStep';
import { TagProgressHeader } from './TagProgress';

const meta: Meta<PreviewArgs> = {
  ...baseMeta,
  title: 'Components/Onboarding/Feed preview/Final',
  args: { ...baseMeta.args, startingTags: 'three' },
};

export default meta;

type Story = StoryObj<PreviewArgs>;

export const StartHere: Story = {
  name: 'Start here',
  parameters: { controls: { disable: true } },
  render: () => <FinalOverview />,
};

export const TheStep: Story = {
  name: 'The step',
  argTypes: { initialOpen: { table: { disable: true } } },
  render: ({ startingTags }) => (
    <TagStep startingTags={startingTags}>
      <FinalTagStep onContinue={fn()} />
    </TagStep>
  ),
};

const STATES = [0, 3, 5, 9, 10, 15, 20];

export const States: Story = {
  name: 'Every state',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-6 bg-background-default p-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold typo-title2">Every state</h1>
        <p className="text-text-tertiary typo-callout">
          The header at each tag count. The burst plays live in The step, when a
          pick crosses 5, 10 or 20.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {STATES.map((count) => (
          <figure
            key={count}
            className="flex flex-col items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-6"
          >
            <figcaption className="self-start font-bold text-text-tertiary typo-footnote">
              {count} {count === 1 ? 'tag' : 'tags'}
            </figcaption>
            <TagProgressHeader burstKey={0} count={count} />
          </figure>
        ))}
      </div>
    </div>
  ),
};

export const OnAPhone: Story = {
  name: 'On a phone',
  parameters: { controls: { disable: true } },
  render: () => (
    <PhoneFrames
      description="390px. The same step at three, five and ten tags. Each frame is live: pick tags to see the bar move."
      frames={[
        { id: 'the-step', label: 'Three tags', args: 'startingTags:three' },
        { id: 'the-step', label: 'Five tags', args: 'startingTags:five' },
        { id: 'the-step', label: 'Ten tags', args: 'startingTags:ten' },
      ]}
      storyPrefix="components-onboarding-feed-preview-final"
      title="On a phone"
    />
  ),
};
