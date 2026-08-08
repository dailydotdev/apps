import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentWorkspaceSkeleton } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspaceSkeleton';

/**
 * /dev/agent-skeleton — what the workspace shows before its agent arrives.
 *
 * The real one only appears for the moment a fetch is in flight, which is too
 * short to review. Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agent skeleton" noindex nofollow />
    <AgentWorkspaceSkeleton isStandalone />
  </AgentDemoProviders>
);

export default Page;
