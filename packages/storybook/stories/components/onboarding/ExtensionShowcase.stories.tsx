import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { ExtensionShowcase } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/defaultFeatures';

const featureIds = defaultExtensionShowcaseFeatures.map(
  (feature) => feature.id,
);

type PlaygroundArgs = React.ComponentProps<typeof ExtensionShowcase> & {
  featureIds: string[];
  maxWidth: number;
};

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Onboarding/ExtensionShowcase',
  component: ExtensionShowcase,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
    controls: { expanded: true },
  },
  argTypes: {
    featureIds: {
      control: { type: 'check' },
      options: featureIds,
      description: 'Which features render, in tour order.',
    },
    defaultFeatureId: { control: { type: 'select' }, options: featureIds },
    maxWidth: {
      control: { type: 'range', min: 640, max: 1280, step: 20 },
      description: 'Width of the container the showcase sits in.',
    },
    features: { table: { disable: true } },
    className: { table: { disable: true } },
    stageClassName: { table: { disable: true } },
  },
  args: {
    featureIds,
    defaultFeatureId: 'newtab',
    maxWidth: 1024,
    onFeatureChange: fn(),
  },
  render: ({ featureIds: selected, maxWidth, ...args }) => (
    <div className="min-h-dvh bg-background-default px-4 py-10">
      <div className="mx-auto" style={{ maxWidth }}>
        <ExtensionShowcase
          {...args}
          features={defaultExtensionShowcaseFeatures.filter((feature) =>
            selected.includes(feature.id),
          )}
        />
      </div>
    </div>
  ),
};

export default meta;
type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {};

export const TourFeatures: Story = {
  name: 'Only the homepage tour features',
  args: { featureIds: ['readmode', 'brief', 'newtab', 'streak'] },
};
