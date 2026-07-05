import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { GivebackGiftButton } from '@dailydotdev/shared/src/features/giveback/components/GivebackGiftButton';
import { GivebackInvitePrompt } from '@dailydotdev/shared/src/features/giveback/components/GivebackInvitePrompt';
import { buildGivebackMilestonePrompt } from '@dailydotdev/shared/src/features/giveback/givebackInvitePrompts';
import { withGiveback } from './giveback.mocks';

// The popover celebrates one thing only: a global milestone being crossed.
const milestonePrompt = buildGivebackMilestonePrompt({
  id: 'milestone-12k',
  value: 12340,
  title: null,
  reachedAt: null,
});

// A stand-in for the old-layout top header so the gift can be judged in its real
// neighbourhood (logo left, action cluster right).
const Header = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex h-16 w-[680px] max-w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
    <span className="font-bold text-text-primary typo-title3">daily.dev</span>
    <div className="ml-auto flex items-center gap-4">
      <span className="size-8 rounded-full bg-surface-float" />
      {children}
      <span className="size-8 rounded-full bg-surface-float" />
      <span className="size-8 rounded-full bg-surface-float" />
    </div>
  </div>
);

const Label = ({ text }: { text: string }): React.ReactElement => (
  <span className="text-text-tertiary typo-caption1">{text}</span>
);

const meta: Meta = {
  title: 'Features/Giveback/Entry points/Header states',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Static poses of the header gift entry on the old layout, for review: resting icon, a community dollar jump, and the global-milestone popover.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj;

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-12 bg-background-default p-8">
      <section data-testid="state-resting" className="flex flex-col gap-2">
        <Label text="1 · Resting — the calm gift entry" />
        <Header>
          <GivebackGiftButton />
        </Header>
      </section>

      <section data-testid="state-dollars" className="flex flex-col gap-2">
        <Label text="2 · Community dollars jumping on the gift (real-time)" />
        <Header>
          <span className="relative inline-flex">
            <GivebackGiftButton />
            <span
              className="pointer-events-none absolute -top-3 left-1/2 whitespace-nowrap font-bold tabular-nums text-status-success typo-callout [text-shadow:0_1px_3px_var(--theme-background-default)]"
              style={{ transform: 'translate(6px, 0)' }}
            >
              +$8
            </span>
          </span>
        </Header>
      </section>

      <section
        data-testid="state-toast-celebrate"
        className="flex flex-col gap-2 pb-52"
      >
        <Label text="3 · Milestone popover — global community moment" />
        <Header>
          <span className="relative inline-flex">
            <GivebackGiftButton />
            <GivebackInvitePrompt
              open
              autoDismissMs={600000}
              celebrate={milestonePrompt.celebrate}
              eyebrow={milestonePrompt.eyebrow}
              headline={milestonePrompt.headline}
              body={milestonePrompt.body}
              ctaLabel={milestonePrompt.ctaLabel}
              placement="below"
              align="end"
            />
          </span>
        </Header>
      </section>
    </div>
  ),
};
