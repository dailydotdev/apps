import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackCauseSelection } from '@dailydotdev/shared/src/features/giveback/components/GivebackCauseSelection';
import { mockCauses, withGiveback } from './giveback.mocks';

// The cause picker grid + category filter chips. Prop-driven: pass the causes,
// the selected ids set, and a toggle handler. These stories wire an interactive
// selection so you can click cards and filter.
const meta: Meta<typeof GivebackCauseSelection> = {
  title: 'Features/Giveback/Cause selection',
  component: GivebackCauseSelection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Interactive: click cards to select, use the category chips to filter. Covers the loaded grid, a pre-selected state, the loading skeleton, and the empty state.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackCauseSelection>;

const Interactive = ({
  preset = [],
  isLoading = false,
  empty = false,
}: {
  preset?: string[];
  isLoading?: boolean;
  empty?: boolean;
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(preset),
  );
  return (
    <div className="mx-auto max-w-4xl">
      <GivebackCauseSelection
        causes={empty ? [] : mockCauses()}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggle={(id) =>
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          })
        }
      />
    </div>
  );
};

export const Default: Story = { render: () => <Interactive /> };

export const WithPreselected: Story = {
  render: () => <Interactive preset={['c-oss', 'c-access', 'c-docs']} />,
};

export const Loading: Story = { render: () => <Interactive isLoading /> };

export const Empty: Story = { render: () => <Interactive empty /> };
