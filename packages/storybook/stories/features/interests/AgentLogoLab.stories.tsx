import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentThinkingOrbLab } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingOrbLab';

/**
 * The thinking indicator, rebuilt as a particle system rather than a set of
 * keyframe tricks: the daily.dev mark is the attractor, and each state is a
 * different force field over the dots sampled around its outline.
 *
 * The gallery itself lives in shared so /dev/agent-indicator can render the
 * same page on a Vercel preview, where Storybook does not exist.
 */
const meta: Meta = {
  title: 'Features/Interests/AgentLogoLab',
  parameters: { layout: 'fullscreen' },
  render: () => <AgentThinkingOrbLab />,
};

export default meta;

export const Default: StoryObj = {};
