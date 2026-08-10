import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentWorkspace } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspace';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';

// `_app` short-circuits `/dev/*` past the app shell, so this reviews the
// workspace without boot, which `/agent/[id]?demo=1` needs.
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agent workspace" noindex nofollow />
    <AgentProvider
      id="demo"
      interest={mockInterest}
      isDemo
      initialMessages={mockConversation}
    >
      <AgentWorkspace
        items={mockFeedItems}
        postsCount={mockAgentPosts.length}
        onDelete={() => undefined}
        isDeleting={false}
        isStandalone
      />
    </AgentProvider>
  </AgentDemoProviders>
);

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;
