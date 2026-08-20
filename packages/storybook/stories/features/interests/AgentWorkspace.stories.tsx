import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentWorkspace } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspace';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/mockChat';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';

const noop = (): void => undefined;

const meta: Meta<typeof AgentWorkspace> = {
  title: 'Features/Interests/AgentWorkspace',
  component: AgentWorkspace,
  parameters: { layout: 'fullscreen' },
  render: () => (
    <AgentDemoProviders>
      <div className="bg-background-default text-text-primary">
        <AgentProvider
          id="demo"
          interest={mockInterest}
          isDemo
          initialMessages={mockConversation}
          findings={mockFeedItems}
          posts={mockAgentPosts}
        >
          <AgentWorkspace
            items={mockFeedItems}
            onDelete={noop}
            isDeleting={false}
          />
        </AgentProvider>
      </div>
    </AgentDemoProviders>
  ),
};

export default meta;

export const Default: StoryObj<typeof AgentWorkspace> = {};
