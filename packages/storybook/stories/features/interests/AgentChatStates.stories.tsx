import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AgentMessage } from '@dailydotdev/shared/src/features/interests/chat';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';
import {
  AgentProvider,
  useAgent,
} from '@dailydotdev/shared/src/features/interests/AgentContext';
import { mockInterest } from '@dailydotdev/shared/src/features/interests/mock';
import { AgentChatSection } from '@dailydotdev/shared/src/features/interests/components/AgentChatSection';
import { AgentComposer } from '@dailydotdev/shared/src/features/interests/components/AgentComposer';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - 1000 * 60 * minutes).toISOString();

const stateMessages: AgentMessage[] = [
  {
    id: 'st-1',
    role: 'user',
    at: minutesAgo(60),
    text: 'fewer announcements, more source-level deep dives',
  },
  {
    id: 'st-2',
    role: 'agent',
    at: minutesAgo(59),
    blocks: [
      {
        type: 'text',
        html: '<p>Noted. I dropped announcement-only posts and reweighted toward material written by the people who did the work.</p><p>Hover this reply for <strong>copy</strong> and <strong>rating</strong> actions.</p>',
      },
      { type: 'posts', posts: [mockFeedPosts[0]] },
    ],
  },
  {
    id: 'st-3',
    role: 'agent',
    at: minutesAgo(30),
    isScheduled: true,
    blocks: [
      {
        type: 'text',
        html: '<p>Daily run — scanned <strong>128</strong> posts, kept 6.</p>',
      },
    ],
  },
  {
    id: 'st-4',
    role: 'user',
    at: minutesAgo(10),
    text: 'Write me a post summarising what you found',
  },
  {
    id: 'st-5',
    role: 'agent',
    at: minutesAgo(10),
    isError: true,
    retryText: 'Write me a post summarising what you found',
  },
];

const QueueDriver = (): null => {
  const { runCommand } = useAgent();
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) {
      return;
    }

    hasFired.current = true;
    runCommand({ text: 'Explore more', label: 'Explore more' });
    runCommand({ text: 'Raise the bar', label: 'Raise the bar' });
  }, [runCommand]);

  return null;
};

const States = (): ReactElement => (
  <AgentDemoProviders>
    <div className="flex min-h-screen justify-center bg-background-default p-6 text-text-primary">
      <div className="flex w-full max-w-[45rem] flex-col gap-8">
        <AgentProvider
          id="states"
          interest={mockInterest}
          isDemo
          initialMessages={stateMessages}
        >
          <QueueDriver />
          <AgentChatSection />
          <AgentComposer />
        </AgentProvider>
      </div>
    </div>
  </AgentDemoProviders>
);

const meta: Meta = {
  title: 'Features/Interests/AgentChatStates',
  parameters: { layout: 'fullscreen' },
  render: () => <States />,
};

export default meta;

export const Default: StoryObj = {};
