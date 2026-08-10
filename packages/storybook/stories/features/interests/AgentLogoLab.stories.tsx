import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentThinkingOrbLab } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingOrbLab';

// The page itself lives in shared so /dev/agent-indicator can render it on a
// Vercel preview, where Storybook does not exist.
const meta: Meta = {
  title: 'Features/Interests/AgentLogoLab',
  parameters: { layout: 'fullscreen' },
  render: () => <AgentThinkingOrbLab />,
};

export default meta;

export const Default: StoryObj = {};
