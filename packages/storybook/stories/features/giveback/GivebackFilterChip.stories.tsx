import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFilterChip } from '@dailydotdev/shared/src/features/giveback/components/GivebackFilterChip';

// The tag-style category filter used across the cause picker, the Causes tab,
// and the action catalog. Bordered surface by default, brand fill when active.
const meta: Meta<typeof GivebackFilterChip> = {
  title: 'Features/Giveback/Filter chip',
  component: GivebackFilterChip,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GivebackFilterChip>;

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <GivebackFilterChip isSelected label="Selected" onClick={() => undefined} />
      <GivebackFilterChip
        isSelected={false}
        label="Default"
        onClick={() => undefined}
      />
    </div>
  ),
};

export const FilterRow: Story = {
  render: () => {
    const filters = ['All', 'Open source', 'Education', 'Climate', 'Accessibility'];
    const [active, setActive] = useState('All');
    return (
      <div className="flex flex-wrap gap-2">
        {filters.map((label) => (
          <GivebackFilterChip
            key={label}
            isSelected={active === label}
            label={label}
            onClick={() => setActive(label)}
          />
        ))}
      </div>
    );
  },
};
