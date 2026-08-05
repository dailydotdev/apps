import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentThinkingMark } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingMark';

const sizes = [16, 20, 24, 48, 96];

const Showcase = (): ReactElement => (
  <div className="flex min-h-screen flex-col gap-12 bg-background-default p-10 text-text-primary">
    <div className="flex items-end gap-10">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <div style={{ width: size, height: size }}>
            <AgentThinkingMark />
          </div>
          <span className="typo-caption2 text-text-tertiary">{size}px</span>
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2 self-start rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2">
      <div className="size-5">
        <AgentThinkingMark />
      </div>
      <span className="typo-footnote text-text-tertiary">
        Working · 12s · 2 tools
      </span>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Features/Interests/AgentThinkingMark',
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase />,
};

export default meta;

export const Default: StoryObj = {};
