import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFunnel } from '@dailydotdev/shared/src/features/giveback/components/GivebackFunnel';
import { mockCauses, withGiveback } from './giveback.mocks';

// The full-screen warm-up funnel shown once before the campaign: intro (with the
// floating explainer video) → how it works → pick causes → impact. `selection`
// is the cause-picker state; here it's an interactive mock so you can toggle
// causes and walk all four steps. Use the toolbar light/dark switch too.
const meta: Meta<typeof GivebackFunnel> = {
  title: 'Features/Giveback/Funnel',
  component: GivebackFunnel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Forced once for everyone, then replayable from a "How it works" button. The default story is the forced run (no close); the Replayable story shows the dismissible variant. Click through the CTAs to see the staggered step animations and the milestone track.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackFunnel>;

const useMockSelection = (preset: string[] = []) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(preset),
  );
  return {
    causes: mockCauses(),
    isLoading: false,
    selectedIds,
    selectedCount: selectedIds.size,
    hasSavedCauses: false,
    isSaving: false,
    save: async () => true,
    toggleCause: (id: string) =>
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
  };
};

export const Forced: Story = {
  render: () => {
    // Nothing pre-selected — matches a brand-new user picking causes for the
    // first time. Click through to the finale to see the value-prop step.
    const selection = useMockSelection();
    return <GivebackFunnel selection={selection} onComplete={() => undefined} />;
  },
};

export const ForcedWithCauses: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Causes already picked, so the finale shows the personalised gratitude line. Walk Got it → Sounds good → Continue → Let’s start.',
      },
    },
  },
  render: () => {
    const selection = useMockSelection(['c-oss', 'c-scholarships', 'c-access']);
    return <GivebackFunnel selection={selection} onComplete={() => undefined} />;
  },
};

export const Replayable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Opened from "How it works" — shows the close button so it can be dismissed.',
      },
    },
  },
  render: () => {
    const selection = useMockSelection();
    return (
      <GivebackFunnel
        selection={selection}
        canClose
        onClose={() => undefined}
        onComplete={() => undefined}
      />
    );
  },
};
