import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { AgentProvider } from '@dailydotdev/shared/src/features/interests/AgentContext';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentWorkspace } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspace';
import {
  mockAgentPosts,
  mockInterest,
} from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedItems } from '@dailydotdev/shared/src/features/interests/mockFeed';
import { mockConversation } from '@dailydotdev/shared/src/features/interests/chat';

/**
 * /dev/agent — internal review surface for the agent workspace.
 *
 * `/agent/[id]?demo=1` renders the same mock workspace inside the real app
 * chrome, which means it needs boot to resolve and so shows nothing on a dev
 * server with no backend behind it. `_app` short-circuits `/dev/*` past the
 * whole app shell, so this route stands the workspace up on its own and stays
 * reviewable anywhere. Carries `noindex`/`nofollow`.
 */
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

/*
 * Client-only. The mock data takes its timestamps from the clock when it is
 * built, so the server's copy and the browser's are seconds apart and every
 * relative time hydrates as a mismatch — "7m" against "7m" that disagree. A
 * review surface gains nothing from being server-rendered, and this removes the
 * whole class rather than silencing one warning.
 */
export default dynamic(() => Promise.resolve(Page), { ssr: false });
