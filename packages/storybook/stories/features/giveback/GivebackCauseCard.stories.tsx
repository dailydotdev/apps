import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackCauseCard } from '@dailydotdev/shared/src/features/giveback/components/GivebackCauseCard';
import { mockCauses } from './giveback.mocks';

const cause = mockCauses()[0];

// The rich, selectable cause card used in the onboarding picker and the "more
// causes to explore" grid: emblem, name, category, full description (clamped),
// a "learn more" link to the cause site, and the select tick.
const meta: Meta<typeof GivebackCauseCard> = {
  title: 'Features/Giveback/Cause card',
  component: GivebackCauseCard,
  args: { cause, index: 0, onToggle: () => undefined },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="grid max-w-[28rem] gap-3 bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GivebackCauseCard>;

export const Unselected: Story = { args: { selected: false } };

export const Selected: Story = { args: { selected: true } };

export const Interactive: Story = {
  parameters: {
    docs: { description: { story: 'Click the card to toggle selection.' } },
  },
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <GivebackCauseCard
        {...args}
        selected={selected}
        onToggle={() => setSelected((value) => !value)}
      />
    );
  },
};

export const WithoutLinkOrDescription: Story = {
  args: {
    selected: false,
    cause: { ...cause, url: null, description: null },
  },
};
