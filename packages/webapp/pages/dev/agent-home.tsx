import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentHomeScreen } from '@dailydotdev/shared/src/features/interests/components/AgentHomeScreen';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';

/**
 * /dev/agent-home — internal review surface for the agents home screen.
 *
 * Same reason as `/dev/agent`: the real page is behind auth and a flag, so it
 * shows nothing on a dev server with no backend. Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agents" noindex nofollow />
    <AgentHomeScreen
      agents={recentMockAgents()}
      onCreate={() => undefined}
      isStandalone
    />
  </AgentDemoProviders>
);

export default Page;
