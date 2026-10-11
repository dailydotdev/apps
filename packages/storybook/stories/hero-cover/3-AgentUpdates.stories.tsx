import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { AgentChatVariant } from './agentChat';
import { AgentChatColumn } from './agentChat';
import { Case, HeroCover, Page, Stage } from './parts';

const meta: Meta = {
  title: 'Hero Cover/3. Agent updates',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const variants: { variant: AgentChatVariant; title: string; note: string }[] = [
  {
    variant: 'group',
    title: 'A · Group chat',
    note: 'Each agent posts as itself, like a team channel. Easiest to scan by tool.',
  },
  {
    variant: 'assistant',
    title: 'B · Assistant',
    note: 'One voice, one release per message, the agent tagged inside the bubble. Closest to talking to Claude.',
  },
  {
    variant: 'terminal',
    title: 'C · Terminal',
    note: "A Claude Code transcript. Speaks the audience's language, gives up some readability.",
  },
];

export const AgentUpdates: StoryObj = {
  name: '3. Agent updates',
  render: () => (
    <Page
      chapter="3"
      question="How do we show what the agents shipped?"
      title="Agent updates as a chat"
      goal="Give the agentic-engineering crowd a reason to check the feed every day: what changed in the tools they use, read like a conversation."
      metric="Show more clicks into the agent update, and return visits from readers who clicked one."
    >
      <Case
        title="Side by side"
        note="One column at the featured card's height. The newest message sits at the bottom, the way a chat reads. Messages stop at four lines, and Show more opens the update."
      >
        <div className="flex flex-wrap gap-10">
          {variants.map(({ variant, title }) => (
            <div key={variant} className="flex flex-col gap-2">
              <span className="text-text-tertiary typo-footnote">{title}</span>
              <div className="flex h-[24.5rem] w-[17.25rem] flex-col">
                <AgentChatColumn variant={variant} className="flex-1" />
              </div>
            </div>
          ))}
        </div>
      </Case>
      {variants.map(({ variant, title, note }) => (
        <Case key={variant} title={`${title} in the cover`} note={note}>
          <Stage columns={5}>
            <HeroCover agentVariant={variant} />
          </Stage>
        </Case>
      ))}
    </Page>
  ),
};
