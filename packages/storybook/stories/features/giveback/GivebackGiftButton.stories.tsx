import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { GivebackGiftButton } from '@dailydotdev/shared/src/features/giveback/components/GivebackGiftButton';
import { withGiveback } from './giveback.mocks';

// The persistent giveback entry point: a calm gift icon in the top header and,
// on the new layout, at the bottom-left of the rail. No ambient progress meter —
// the gift stays quiet at rest and only comes alive in the celebration moments.
const meta: Meta<typeof GivebackGiftButton> = {
  title: 'Features/Giveback/Entry points/Gift button',
  component: GivebackGiftButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Resting states for the header/rail gift icon. Calm at rest — just the gift, no progress meter and no notification badge. Press feedback scales down.',
      },
    },
  },
  decorators: [withGiveback()],
  argTypes: {
    variant: { control: 'inline-radio', options: ['header', 'rail'] },
    showLabel: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackGiftButton>;

const HeaderFrame = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex w-[560px] items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-3">
    <span className="font-bold text-text-primary typo-title3">daily.dev</span>
    <div className="ml-auto flex items-center gap-3">
      {children}
      <span className="size-8 rounded-full bg-surface-float" />
      <span className="size-8 rounded-full bg-surface-float" />
    </div>
  </div>
);

const RailFrame = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex h-[420px] w-[240px] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-3">
    <div className="flex flex-col gap-2">
      {['Feed', 'Explore', 'Bookmarks'].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-10 px-2 py-1.5 text-text-tertiary typo-callout"
        >
          <span className="size-5 rounded bg-surface-float" />
          {item}
        </div>
      ))}
    </div>
    <div className="mt-auto border-t border-border-subtlest-tertiary pt-2">
      {children}
    </div>
  </div>
);

export const Playground: Story = {
  args: {
    variant: 'header',
  },
};

export const Placement: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-text-tertiary typo-caption1">Header</span>
        <HeaderFrame>
          <GivebackGiftButton />
        </HeaderFrame>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-text-tertiary typo-caption1">Rail, labelled</span>
        <RailFrame>
          <GivebackGiftButton variant="rail" showLabel />
        </RailFrame>
      </div>
    </div>
  ),
};
